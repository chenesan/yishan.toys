import React from 'react';
import { Link } from 'gatsby'

import { rhythm } from '../utils/typography'

export default class PostList extends React.Component {
  render() {
    const { posts } = this.props;
    return (
      <ul>
        <h2>文章列表</h2>
        {posts.map(({ node }) => {
          const title = node.frontmatter.title || node.fields.slug
          return (
            <li key={node.fields.slug}>
              <h3
                style={{
                  marginTop: rhythm(1),
                  marginBottom: rhythm(1 / 4),
                }}
              >
                <Link style={{ boxShadow: `none` }} to={node.fields.slug}>
                  {title}
                </Link>
              </h3>
              <small>{node.frontmatter.date}</small>
              <p dangerouslySetInnerHTML={{ __html: node.excerpt }} />
            </li>
          )
        })}
      </ul>
    );
  }
}
