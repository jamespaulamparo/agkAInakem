import { Link } from 'react-router-dom'
import { Page } from '../components/Layout'

export default function NotFound() {
  return (
    <Page className="py-28 text-center">
      <p className="word text-7xl italic text-teal-ink">lost</p>
      <p className="mt-4 text-ink-muted">This page doesn&rsquo;t exist.</p>
      <Link to="/" className="btn-primary mt-8">Home</Link>
    </Page>
  )
}
