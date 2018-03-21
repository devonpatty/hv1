async function replaceSlash(arr) {
  const books = arr;
  for (let i = 0; i !== books.length; i += 1) {
    const str = books[i].description.replace(/[\\"]/g, '');
    books[i].description = str;
  }
  return books;
}

async function singleLink(data, offset, limit, search, port) {
  const searched = {
    links: {
      self: {
        href: `http://localhost:${port}/books?search=${search}&offset=${offset}&limit=${limit}`,
      },
    },
    limit,
    offset,
    items: await replaceSlash(data),
  };
  if (offset > 0) {
    searched.links.prev = {
      href: `http://localhost:${port}/books?search=${search}&offset=${offset - limit}&limit=${limit}`,
    };
  }
  if (searched.items.length <= limit) {
    searched.links.next = {
      href: `http://localhost:${port}/books?search=${search}&offset=${offset + limit}&limit=${limit}`,
    };
  }
  return searched;
}

async function manyLink(data, offset, limit, port) {
  const searched = {
    links: {
      self: {
        href: `http://localhost:${port}/books?offset=${offset}&limit=${limit}`,
      },
    },
    limit,
    offset,
    items: await replaceSlash(data),
  };
  if (offset > 0) {
    searched.links.prev = {
      href: `http://localhost:${port}/books?offset=${offset - limit}&limit=${limit}`,
    };
  }
  if (searched.items.length <= limit) {
    searched.links.next = {
      href: `http://localhost:${port}/books?offset=${offset + limit}&limit=${limit}`,
    };
  }
  return searched;
}

module.exports = {
  singleLink,
  manyLink,
};

