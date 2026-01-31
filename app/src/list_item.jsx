import './list_item.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons'


export function ListItem() {
  return (
      <li>
          <h3>UserName </h3>
          <div className="spacer" />
          <div className="flex-container">
              <div className="block">
                <h3>24</h3><h5 style={{ position: "relative", top: "-2px"}}> unique species</h5>
              </div>
              <div className="block">
                <h3>102</h3><h5 style={{ position: "relative", top: "-2px"}}> total observations</h5>
              </div>
              <FontAwesomeIcon icon={faAngleDown}/>
          </div>
      </li>
  )
}

