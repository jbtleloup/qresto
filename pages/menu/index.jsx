import React, { useContext, useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import useSWR from 'swr';
import fetchSwal from '../../lib/fetchSwal';
import { UserContext } from '../../components/UserContext';
import Layout from '../../components/layout';
import Dish from '../../components/dish';
import fetch from '../../lib/fetch';
import Router from 'next/router';

const fakeSections = [
  {
    title: 'Appetizer',
    _id: 1,
    dishes: [
      {
        _id: 1,
        ingredients: 'poulet, pate, basil',
        description: ' poulet pate au basil',
        title: 'poulet au basil maison',
        picture: null,
      },
      {
        _id: 2,
        ingredients: 'poulet, pate, basil',
        description: ' poulet pate au basil',
        title: 'poulet au basil maison',
        picture: null,
      },
    ],
  },
  {
    title: 'Entree',
    _id: 2,
    dishes: [
      {
        _id: 1,
        ingredients: 'poulet, pate, basil',
        description: ' poulet pate au basil',
        title: 'poulet au basil maison',
        picture: null,
      },
      {
        _id: 2,
        ingredients: 'poulet, pate, basil',
        description: ' poulet pate au basil',
        title: 'poulet au basil maison',
        picture: null,
      },
    ],
  },
];

const SearchBar = ({ dishesList, selectedDish }) => {
  const handleSelectedDishWrapper = (title) => {
    const dish = dishesList.find((d) => d.title === title);
    if (dish) selectedDish(dish._id);
  };
  return (
    <div className="pt-4">
      <input type="search" list="dishes" placeholder="search your dishes..." className="w-full bg-transparent text-2xl border px-4" onChange={(e) => handleSelectedDishWrapper(e.target.value)} />
      <datalist id="dishes">
        {dishesList ? dishesList.map((dish) => <option key={dish._id} value={dish.title} />) : ''}
      </datalist>
    </div>
  );
};

const MenuSection = ({
  id, title, dishes, dishesList, setTitle, deleteSection, selectedDish, deleteDish, modifyDish,
}) => {
  const deleteSectionWrapper = () => deleteSection(id);
  const setTitleWrapper = (newTitle) => setTitle(id, newTitle);
  const handleSelectedDishWrapper = (dishId) => selectedDish(dishId, id);
  const handleDeleteDishWrapper = (dishId) => deleteDish(dishId, id);
  const handleModifyDishWrapper = (dishId) => modifyDish(dishId);
  return (
    <div className="mt-5">
      <div className="mx-16">
        <div className="flex justify-between">
          <input type="text" className="text-3xl text-gray-900 font-semibold bg-transparent" value={title} onChange={(e) => setTitleWrapper(e.target.value)} />
          <button className="text-red-700 text-lg font-semibold mr-5" type="button" onClick={() => deleteSectionWrapper()}>Supprimer Section</button>
        </div>
        <div className="w-full">
          <SearchBar dishesList={dishesList} selectedDish={handleSelectedDishWrapper} />
        </div>
      </div>
      {/* eslint-disable-next-line max-len */}
      { dishes.map((dish) => <Dish key={dish._id} id={dish._id} ingredients={dish.ingredients} description={dish.description} title={dish.title} url={dish.picture} handleDelete={handleDeleteDishWrapper} handleModify={handleModifyDishWrapper} />) }
    </div>
  );
};

const ManageableDishMenu = () => {
  const [title, setTitle] = useState('Lunch Weekdays Menu');
  const [sections, setSections] = useState(fakeSections);
  const [sectionNumber, setSectionNumber] = useState(2);
  const { data, error, revalidate } = useSWR('/api/dishList', fetch);
  // TODO: error handling

  const dishesList = data ? data.data.dishes : null;

  const updateDishStateFromDishId = (dishId) => {
    sections.forEach((section) => {
      const dishIndex = section.dishes.findIndex((dish) => dish._id === dishId);
      // eslint-disable-next-line max-len
      sections[sections.indexOf(section)].dishes[dishIndex] = dishesList.find((dish) => dish._id === dishId);
    });
    setSections([...sections]);
  };
  if (dishesList) {
    // eslint-disable-next-line max-len
    const dishesToUpdate = sections.map((section) => section.dishes.map((dish) => (dishesList.find((d) => d !== dish && d._id === dish._id) ? dishesList.find((d) => d !== dish && d._id === dish._id)._id : undefined)));
    let dishesToUpdateCleaned = [];
    // eslint-disable-next-line max-len
    dishesToUpdate.forEach((section) => section.forEach((dishId) => { if (dishId) dishesToUpdateCleaned.push(dishId); }));
    dishesToUpdateCleaned = [...new Set(dishesToUpdateCleaned)];
    dishesToUpdateCleaned.map((dishId) => updateDishStateFromDishId(dishId));
  }

  const handleSectionTitle = (id, newTitle) => {
    const index = sections.findIndex((sec) => sec._id === id);
    sections[index] = {
      ...sections[index],
      title: newTitle,
    };
    setSections([...sections]);
  };
  const addSection = () => {
    const section = {
      title: 'New Section',
      _id: sectionNumber + 1,
      dishes: [],
    };
    sections.push(section);
    setSections([...sections]);
    setSectionNumber(sectionNumber + 1);
  };
  const deleteSection = (sectionId) => {
    const index = sections.findIndex((sec) => sec._id === sectionId);
    sections.splice(index, 1);
    setSections([...sections]);
    setSectionNumber(sectionNumber - 1);
  };
  const handleSelectedDish = (dishId, sectionId) => {
    const dish = dishesList.find((d) => d._id === dishId);
    const index = sections.findIndex((sec) => sec._id === sectionId);
    const isDishInSection = sections[index].dishes.find((d) => d === dish);
    if (!isDishInSection) {
      sections[index].dishes.push(dish);
      setSections([...sections]);
    }
  };
  const handleDeleteDish = (dishId, sectionId) => {
    const sectionIndex = sections.findIndex((sec) => sec._id === sectionId);
    const dishIndex = sections[sectionIndex].dishes.findIndex((dish) => dish._id === dishId);
    sections[sectionIndex].dishes.splice(dishIndex, 1);
    setSections([...sections]);
  };
  const handleModifyDish = (dishId) => {
    // TODO: Show error dish if is not in database (cannot modify fake dish)
    if (typeof dishId === 'number') return;
    Router.push({
      pathname: '/dish/add',
      query: { id: dishId },
    });
  };
  return (
    <div className="bg-gray-100 border rounded-xl shadow-2xl">
      <div className="mx-32 my-8">
        <input className="text-5xl text-gray-900 font-semibold bg-transparent" value={title} onChange={(e) => setTitle(e.target.value)} />
        <hr className="border-gray-500" />
        {
          sections.map((section) => (
            <MenuSection
              key={section._id}
              id={section._id}
              title={section.title}
              dishes={section.dishes}
              dishesList={dishesList}
              setTitle={handleSectionTitle}
              deleteSection={deleteSection}
              selectedDish={handleSelectedDish}
              deleteDish={handleDeleteDish}
              modifyDish={handleModifyDish}
            />
          ))
        }
        <div className="flex justify-end pt-4">
          <button type="button" className="mr-4 text-xl font-semibold" onClick={() => addSection()}>Ajouter une section</button>
          <button type="button" className="text-xl font-semibold text-green-500">Sauvegarder</button>
        </div>
      </div>
    </div>
  );
};

const MenuPage = () => {
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
        <title>Ajouter un Menu</title>
      </Head>
      <div className="bg-gray-300">
        <div className="mx-32 pt-10">
          <ManageableDishMenu />
        </div>
        <br />
      </div>
    </Layout>
  );
};

export default MenuPage;
