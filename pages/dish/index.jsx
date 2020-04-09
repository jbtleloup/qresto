import React, { useContext, useState } from 'react';
import Head from 'next/head';
import useSWR from 'swr';
import Link from 'next/link';
import Router from 'next/router';
import fetchSwal from '../../lib/fetchSwal';
import fetch from '../../lib/fetch';

import { UserContext } from '../../components/UserContext';
import Layout from '../../components/layout';
import Dish from '../../components/dish';

const DishList = () => {
  const { data, error, revalidate } = useSWR('/api/dishList', fetch);
  // TODO: Error handling
  if (error) {
    console.log('failed to load');
    return (
      <div>
        error:
        {' '}
        {error}
      </div>
    );
  }
  const handleDelete = (id) => {
    fetchSwal.delete(`/api/dish?id=${id}`, null, null, true).then((resp) => {
      console.log(resp);
      revalidate() // TODO: mutate instead of revalidate maybe thing of state?
        .then((r) => console.log(r));
    });
  };

  const handleModify = (id) => {
    console.log(id);
    Router.push({
      pathname: '/dish/add',
      query: { id },
    });
  };
  return (
    <div>
      {
        data ? data.data.dishes.map((dish) => (
          <Dish
            key={dish._id}
            id={dish._id}
            title={dish.title}
            description={dish.description}
            ingredients={dish.ingredients}
            url={dish.picture}
            handleDelete={handleDelete}
            handleModify={handleModify}
          />
        )) : 'loading...'
      }
    </div>
  );
};

const DishPage = () => {
  const {
    state: {
      isLoggedIn,
      user: {
        name, email, bio, profilePicture, emailVerified,
      },
    },
  } = useContext(UserContext);
  if (!isLoggedIn) {
    return (
      <Layout>
        <p>Please sign in</p>
      </Layout>
    );
  }
  return (
    <Layout>
      <Head>
        <title>Tout Vos plats</title>
      </Head>
      <div>
        <br />
        <h1 className="text-4xl text-gray-900 font-semibold lg:mx-32 mx-3">Vos plats</h1>
        <DishList />
        <br />
      </div>
    </Layout>
  );
};

export default DishPage;
