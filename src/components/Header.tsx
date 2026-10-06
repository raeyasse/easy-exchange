import { Link } from 'react-router-dom'
import { UserMenu } from './UserMenu'

export function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="brand">
          Easy Exchange
        </Link>
        <Link to="/records/new">List a record</Link>
        <UserMenu />
      </div>
    </header>
  )
}
