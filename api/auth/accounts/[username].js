import { proxy } from '../../_proxy.js'

export default function handler(req, res) {
  const username = Array.isArray(req.query.username) ? req.query.username[0] : req.query.username
  return proxy(req, res, `/api/auth/accounts/${encodeURIComponent(username || '')}`)
}
