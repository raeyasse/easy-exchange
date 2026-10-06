import { Link } from 'react-router-dom'

export function NotFoundPage({ message = 'This page does not exist.' }: { message?: string }) {
  return (
    <main className="page">
      <h1>Not found</h1>
      <p>{message}</p>
      <p className="page-actions">
        <Link to="/">Back to all records</Link>
      </p>
    </main>
  )
}
