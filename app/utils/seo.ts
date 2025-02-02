type OgMeta = 'og:title' | 'og:description' | 'og:image' | 'og:site_name'
type XMeta =
  | 'twitter:card'
  | 'twitter:title'
  | 'twitter:description'
  | 'twitter:image'

type GetOgMeta = Record<OgMeta | XMeta, string>
export function getMeta(meta: GetOgMeta) {
  return Object.entries(meta).map(([key, value]) => ({
    name: key,
    content: value
  }))
}
