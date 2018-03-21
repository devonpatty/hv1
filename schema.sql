CREATE TABLE IF NOT EXISTS users (
    id          serial primary key,
    username        varchar(65) CHECK (char_length(username) >= 3) UNIQUE NOT NULL,
    password        varchar(255) CHECK (char_length(password) >= 6) NOT NULL,
    name            varchar(65) NOT NULL,
    url             text
);

CREATE TABLE IF NOT EXISTS categories (
    cateId          serial primary key,
    name            varchar(65) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS books (
    bookId          serial primary key,
    title           text UNIQUE NOT NULL,
    isbn13          varchar(13) CHECK (char_length(isbn13) = 13) UNIQUE NOT NULL,
    author          varchar(65),
    description     text,
    category        int NOT NULL,
    isbn10          varchar(10),
    published       varchar(25),
    pagecount       varchar(25),
    language        varchar(2),
    FOREIGN KEY (category) REFERENCES categories(cateId)
);

CREATE TABLE IF NOT EXISTS readbook (
    id              serial,
    userId          int NOT NULL,
    bookId          int NOT NULL,
    star            smallint CHECK (star >= 1 AND star <= 5) NOT NULL,
    review            text,
    FOREIGN KEY (userId) REFERENCES users(userId),
    FOREIGN KEY (bookId) REFERENCES books(bookId)
);