async function replaceSlash(arr) {
  const books = arr;
  for (let i = 0; i !== books.length; i += 1) {
    const str = books[i].description.replace(/[\\"]/g, '');
    books[i].description = str;
  }
  return books;
}

module.exports = {
  replaceSlash,
};

