import React from 'react';

export default ({
  id, title, description, ingredients, url, handleDelete, handleModify,
}) => {
  const handleDeleteWrapper = () => handleDelete(id);
  const handleModifyWrapper = () => handleModify(id);
  return (
    <div>
      <div className="sm:mx-32 mx-3 py-5">
        <br />
        <div className="bg-white shadow-xl rounded-lg overflow-hidden sm:flex">
          {url
            ? <img className="sm:w-1/3 h-auto object-cover" src={url} alt="Your fabulous dish" />
            : (<img className="sm:w-1/3 h-auto object-cover" src="dish-example.jpg" alt="Your fabulous dish" />)}
          <div className="w-full">
            <div className="sm:px-8 px-4 pt-6 pb-4 mb-4">
              <div className="mb-4">
                <h1 className="text-gray-800 font-bold text-xl">{title}</h1>
              </div>
              <div className="mb-4">
                <p className="text-gray-700 text-lg">{description}</p>
              </div>
              <div className="mb-4 flex">
                <p className="text-gray-700 text-lg">
                  <span className="text-gray-800 font-semibold">Ingredients: </span>
                  {ingredients}
                </p>
              </div>
              <div className="mb-4">
                <p className="text-gray-700 text-lg">
                  <span className="text-gray-800 font-semibold">Allergens: </span>
                  {' '}
                  celery, gluten, crustaceans, eggs, fish, lupin, milk, molluscs,
                  mustard, peanuts, sesame, soybeans, sulphur dioxide and sulphites, tree nuts
                </p>
              </div>
              <div className="flex justify-end">
                <button className="mr-10 pt-3 font-semibold" type="button" onClick={handleModifyWrapper}>Modifier</button>
                <button className="mr-10 pt-3 text-red-700 font-semibold" type="button" onClick={handleDeleteWrapper}>Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
