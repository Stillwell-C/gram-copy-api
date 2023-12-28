const userPostKey = (userID) => `userposts#${userID}`;
const searchKey = (searchParam, query) => `${searchParam}:${query}`;

module.exports = { userPostKey, searchKey };
