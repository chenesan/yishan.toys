import React from 'react'
import { graphql, Link } from 'gatsby'
import _ from 'lodash'

import Bio from '../components/Bio'
import Layout from '../components/Layout'
import SEO from '../components/seo'
import PostList from '../components/PostList';

class BlogIndex extends React.Component {
  render() {
    const { data } = this.props
    const siteTitle = data.site.siteMetadata.title;
    const description = data.site.siteMetadata.description;
    const posts = data.allMarkdownRemark.edges
    const tags = data.tags.group
    const postList = <PostList posts={posts} />;
    const tagsList = (
      <section>
        <h2>Tags</h2>
        <ul>
          {tags.map(group => (<li
            key={group.fieldValue}
            style={{ display: 'inline-block', marginRight: '.5em', marginBottom: '.5em' }}
          >
            <Link to={`/tags/${_.kebabCase(group.fieldValue)}`}>{group.fieldValue}</Link>
          </li>))}
        </ul>
      </section>
      
    );
    return (
      <Layout
        title={siteTitle}
        left={postList}
        right={tagsList}
        top={<React.Fragment>
          <SEO
            title={siteTitle}
            description={description}
            keywords={[`blog`, `gatsby`, `javascript`, `react`, '前端', '書介', '書評', 'css']}
          />
          <Bio />
        </React.Fragment>}        
      /> 
    )
  }
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            hidden
          }
        }
      }
    }
    tags: allMarkdownRemark(limit: 2000) {
      group(field: frontmatter___tags) {
        fieldValue
      }
    }
  }
`
