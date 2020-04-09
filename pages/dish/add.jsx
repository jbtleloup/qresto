import React, { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { UserContext } from '../../components/UserContext';
import Layout from '../../components/layout';
import fetchSwal from '../../lib/fetchSwal';
import fetch from '../../lib/fetch';

const MenuPage = () => {
  const [ingredients, setIngredients] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [id, setId] = useState('');
  const [url, setUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDishUpdate, setIsDishUpdate] = useState(false);
  const dishFileInputRef = React.createRef();
  const dishPictureRef = React.createRef();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (isUpdating) return;
    setIsUpdating(true);
    const formData = new FormData();
    if (dishFileInputRef.current.files[0]) {
      formData.append('dishPicture', dishFileInputRef.current.files[0]);
    } else {
      formData.append('pictureUrl', url);
    }
    formData.append('title', title);
    formData.append('description', description);
    formData.append('ingredients', ingredients);
    if (!isDishUpdate) {
      fetchSwal.post('/api/dish', formData, null, true)
        .then(() => {
          setIsUpdating(false);
        });
    } else {
      formData.append('id', id);
      fetchSwal.patch('/api/dish', formData, null, true)
        .then(() => {
          setIsUpdating(false);
        });
    }
  };
  const handleLoadImage = (e) => {
    const output = dishPictureRef.current;
    output.src = e.target ? URL.createObjectURL(e.target.files[0]) : e;
    // TODO: URL.revokeObjectURL
  };

  function handleIngredientsInput(e) {
    setIngredients(e.target.value);
  }

  const router = useRouter();
  if (router.query.id) {
    const { id } = router.query;
    const { data, error, mutate } = useSWR('/api/dishList', fetch);
    if (error) {
      console.log(`error fetching with id: ${error}`);
    }
    if (!data) {
      // TODO: Disply loading banner
      useEffect(() => {
        console.log('loading');
      });
    } else {
      const dish = data.data.dishes.find((d) => d._id === id);
      useEffect(() => {
        console.log(dish);
        setId(dish._id);
        setTitle(dish.title);
        setDescription(dish.description);
        setIngredients(dish.ingredients);
        if (dish.picture) {
          handleLoadImage(dish.picture);
          setUrl(dish.picture);
        }
        setIsDishUpdate(true);
      }, []);
    }
  }

  return (
    <>
      <div className="lg:mx-32 mx-3 py-5">
        <h2 className="text-4xl text-gray-900 font-semibold">Ajouter un plat!</h2>
        <br/>
        <div className="bg-white shadow-xl rounded-lg overflow-hidden sm:flex">
          {/* <label htmlFor="dish-file-input" className="sm:w-3/4 block">
            <img className="h-auto w-full object-cover cursor-pointer" src="dish-example.jpg" alt="Your fabulous dish" id="image-dish" />
            <input className="hidden" type="file" accept="image/*" id="dish-file-input" />
          </label> */}
          <img className="sm:w-1/3 h-auto object-cover" src="/dish-example.jpg"
               alt="Your fabulous dish" id="image-dish" ref={dishPictureRef} />
          <div className="w-full">
            <form onSubmit={handleSubmit} className="sm:px-8 px-4 pt-6 pb-4 mb-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dishname">
                  Nom du Plat
                  <input
                    className="shadow border w-full py-2 px-3 text-gray-700 focus:outline-none"
                    type="text"
                    placeholder="Pork Belly Ramen"
                    name="dishname"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2"
                       htmlFor="dishdescription">
                  Description du plat
                  <textarea
                    className="shadow border w-full py-2 px-3 text-gray-700 focus:outline-none h-24"
                    placeholder="A simple bowl of unctuous roasted pork belly ramen with noodles in a deeply flavourful broth is the perfect warming, comfort food."
                    name="dishdescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2"
                       htmlFor="dishingredients">
                  Ingrédients
                  <input
                    className="shadow border w-full py-2 px-3 text-gray-700 focus:outline-none"
                    type="text"
                    placeholder="Pork Belly, ramen noodle, ginger, soy sauce..."
                    name="dishingredients"
                    value={ingredients}
                    onChange={(event) => handleIngredientsInput(event)}
                  />
                </label>
              </div>
              <div className="mb-4">
                <p className="block text-gray-700 text-sm font-bold mb-2">
                  Allergens:
                  {' '}
                  {/* {!ingredient.length ? "Pas d'allergenes" : ingredient.join(', ')} */}
                </p>
              </div>
              <br/>
              <div className="sm:flex sm:justify-between sm:items-center">
                <label
                  htmlFor="file-upload"
                  className="block uppercase font-normal py-2 px-4 rounded-md border border-red-700 text-red-700 bg-white
                  hover:bg-red-700 hover:text-white cursor-pointer sm:1/3 lg:w-1/4 text-center text-xl"
                >
                  Image
                  <input id="file-upload" type="file" accept="image/*" className="hidden"
                         ref={dishFileInputRef} onChange={(event) => handleLoadImage(event)} />
                </label>
                <button
                  className="bg-red-700 text-white uppercase font-normal mt-3 sm:mt-0 py-2 px-4 rounded-md hover:bg-white border-red-700 border hover:text-red-700
                  lg:w-1/4 sm:w-1/2 w-full tracking-widest text-xl"
                  type="submit"
                  disabled={isUpdating}
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

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
      <MenuPage/>
    </Layout>
  );
};

export default IndexPage;
