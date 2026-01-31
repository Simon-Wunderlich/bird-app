import './list_item.css'


export function ListItem() {
  return (
      <li>
          <h3>UserName </h3>
          <div className="spacer" />
          <div className="flex-container">
              <div className="block">
                <h3>24</h3><h5> unique species</h5>
              </div>
              <div className="block">
                <h3>102</h3><h5> total observations</h5>
              </div>
          </div>
      </li>
  )
}

