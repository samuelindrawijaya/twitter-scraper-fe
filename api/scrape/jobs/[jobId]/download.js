import { proxy } from '../../../_proxy.js'

export default function handler(req, res) {
  const jobId = Array.isArray(req.query.jobId) ? req.query.jobId[0] : req.query.jobId
  return proxy(req, res, `/api/scrape/jobs/${encodeURIComponent(jobId || '')}/download`)
}
