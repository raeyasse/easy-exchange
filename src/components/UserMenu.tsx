import { Link } from 'react-router-dom'
import { useAppData } from '../AppDataProvider'

export function UserMenu() {
  const { state, activeUser, switchUser } = useAppData()

  return (
    <div className="user-menu">
      <Link to={`/users/${activeUser.id}`}>{activeUser.name}</Link>
      <label className="sr-only" htmlFor="user-switch">
        Switch user
      </label>
      <select
        id="user-switch"
        value={activeUser.id}
        onChange={(event) => switchUser(event.target.value)}
      >
        {state.users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </div>
  )
}
