import React from 'react'
import { Link } from 'gatsby'

import { rhythm, scale } from '../utils/typography'
import '../styles/global.css'

class Layout extends React.Component {
  render() {
    const { title, top, left, right } = this.props
    const header = (
      <h1
        style={{
          ...scale(1.5),
          marginBottom: rhythm(1.5),
          marginTop: 0,
        }}
      >
        <Link
          style={{
            boxShadow: `none`,
            textDecoration: `none`,
            color: `inherit`,
          }}
          to={`/`}
        >
          {title}
        </Link>
      </h1>
    )
    return (
      <div
        style={{
          marginLeft: `auto`,
          marginRight: `auto`,
          maxWidth: rhythm(32),
          padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
        }}
      >
        {header}
        {top}
        <div>
          <div style={{ 
            display: 'inline-block',
            width: '70%',
            verticalAlign: 'top',
          }}>
            {left}
          </div>
          <div style={{
            display: 'inline-block',
            width: '30%',
            verticalAlign: 'top',
          }}>
            {right}
          </div>
        </div>
        <footer>
          © {new Date().getFullYear()}, Built with
          {` `}
          <a href="https://www.gatsbyjs.org">Gatsby</a>
        </footer>
      </div>
    )
  }
}

export default Layout
