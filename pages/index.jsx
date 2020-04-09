import React, { useContext} from 'react';
import { UserContext } from '../components/UserContext';
import Layout from '../components/layout';

const IndexPage = () => {
  const {
    state: {
      isLoggedIn,
      user: { name },
    },
  } = useContext(UserContext);
  if (!isLoggedIn) {
    return (
      <Layout>
        <div>
          <h2>
            Please Login
          </h2>
          <p>Have a wonderful day.</p>
        </div>
      </Layout>
    );
  }
  return (
    <Layout>
      <p>
        Hello {' '}
        { name }
        , This page is under construction
      </p>
    </Layout>
  );
};

export default IndexPage;
