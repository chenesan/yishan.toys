import React from 'react';
import { Link } from 'gatsby';

const TagsList = ({tags}) => {
  return (
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
}

export default TagsList;