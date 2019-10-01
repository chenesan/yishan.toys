import React from "react"
import PropTypes from "prop-types"
import { graphql } from "gatsby"
import Bio from "../components/Bio";
import Layout from "../components/Layout";
import PostList from "../components/PostList"
import SEO from "../components/seo";
import TagsList from "../components/TagsList";

const Tags = ({ pageContext, data, location }) => {
  const { tag, tags } = pageContext
  const { edges } = data.allMarkdownRemark
  const siteTitle = data.site.siteMetadata.title
  const content = <React.Fragment>
    <SEO
      title={`posts about ${tag}`}
      keywords={[`blog`, tag, `javascript`, `react`]}
    />
    <Bio />
    <h2>Tag: {tag}</h2>
    <PostList posts={edges} />
  </React.Fragment>
  const tagsList = <TagsList tags={tags} />
  return (
    <Layout title={siteTitle} left={content} right={tagsList} />
  )
}
Tags.propTypes = {
  pageContext: PropTypes.shape({
    tag: PropTypes.string.isRequired,
    tags: PropTypes.array.isRequired,
  }),
  data: PropTypes.shape({
    allMarkdownRemark: PropTypes.shape({
      totalCount: PropTypes.number.isRequired,
      edges: PropTypes.arrayOf(
        PropTypes.shape({
          node: PropTypes.shape({
            frontmatter: PropTypes.shape({
              title: PropTypes.string.isRequired,
            }),
            fields: PropTypes.shape({
              slug: PropTypes.string.isRequired,
            }),
          }),
        }).isRequired
      ),
    }),
  }),
}
export default Tags
export const pageQuery = graphql`
  query($tag: String) {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      limit: 2000
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { tags: { in: [$tag] } } }
    ) {
      totalCount
      edges {
        node {
          excerpt(pruneLength: 160)
          fields {
            slug
          }
          frontmatter {
            title
          }
        }
      }
    }
  }
`