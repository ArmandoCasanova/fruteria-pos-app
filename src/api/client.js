import localforage from 'localforage'

export const dbStore = localforage.createInstance({ name: 'FruteriaDB', storeName: 'products' })
export const syncQueue = localforage.createInstance({ name: 'FruteriaQueue', storeName: 'operations' })

const normalizeString = (str) => 
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()

const productSort = (a, b) => {
  const catA = a.category === 'ABARROTE CON CODIGO'
  const catB = b.category === 'ABARROTE CON CODIGO'
  
  if (catA && !catB) return 1
  if (!catA && catB) return -1
  
  return (b.sales_count || 0) - (a.sales_count || 0)
}

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-API-Key': import.meta.env.VITE_API_KEY
})

export const fetchRemoteProducts = async (baseUrl) => {
  if (!baseUrl) throw new Error('IP no configurada')
  const res = await fetch(`${baseUrl}/api/products`, {
    headers: getHeaders()
  })
  if (!res.ok) throw new Error('Error de red')
  const data = await res.json()
  
  const filtered = data.filter(p => {
    const name = normalizeString(p.name || '')
    return name !== 'varios' && name !== 'pollo'
  })

  const mapped = filtered.map(p => ({
    ...p,
    image: p.image && p.image.startsWith('/') ? `${baseUrl}${p.image}` : p.image
  })).sort(productSort)

  await dbStore.clear()
  for (const item of mapped) {
    await dbStore.setItem(String(item.id), item)
  }
  return mapped
}

export const getLocalProducts = async () => {
  const keys = await dbStore.keys()
  const items = await Promise.all(keys.map(k => dbStore.getItem(k)))
  return items
    .filter(p => {
      const name = normalizeString(p.name || '')
      return name !== 'varios' && name !== 'pollo'
    })
    .sort(productSort)
}

export const pushProduct = async (baseUrl, product) => {
  if (!baseUrl) {
    await dbStore.setItem(String(product.id), product)
    await queueOperation('upsert-product', product)
    return product
  }

  try {
    const res = await fetch(`${baseUrl}/api/upsert-product`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(product)
    })
    if (!res.ok) throw new Error('Error al guardar')
    const saved = await res.json()
    await dbStore.setItem(String(saved.id), saved)
    return saved
  } catch {
    await dbStore.setItem(String(product.id), product)
    await queueOperation('upsert-product', product)
    return product
  }
}

const queueOperation = async (type, payload) => {
  const id = Date.now().toString()
  await syncQueue.setItem(id, { id, type, payload, timestamp: Date.now() })
}

export const processQueue = async (baseUrl) => {
  if (!baseUrl) return
  const keys = await syncQueue.keys()
  if (keys.length === 0) return

  for (const key of keys) {
    const op = await syncQueue.getItem(key)
    try {
      if (op.type === 'upsert-product') {
        await fetch(`${baseUrl}/api/upsert-product`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(op.payload)
        })
      }
      await syncQueue.removeItem(key)
    } catch {
      break
    }
  }
}

export const generateRemotePin = async (baseUrl, pin) => {
  if (!baseUrl) throw new Error('IP no configurada')
  const res = await fetch(`${baseUrl}/api/generate-temp-pin`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ pin })
  })
  if (!res.ok) throw new Error()
  return await res.json()
}

export const fetchSettings = async (baseUrl) => {
  if (!baseUrl) throw new Error('IP no configurada')
  const res = await fetch(`${baseUrl}/api/settings`, {
    headers: getHeaders()
  })
  if (!res.ok) throw new Error('Error de red')
  return await res.json()
}
