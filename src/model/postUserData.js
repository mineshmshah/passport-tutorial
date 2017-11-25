const connect = require('../../db/db_connections');

const post = {};

post.users = (fb_id, fb_name, fb_email, fb_avatar, new_user, fb_url,callback)=>{
  const sqlQuery = `
    INSERT INTO users (fb_id,name,email,avatar,newUser,profile_url)
    VALUES ($1, $2, $3, $4, $5, $6);
  `;
  connect.query(sqlQuery, [fb_id,fb_name, fb_email, fb_avatar, new_user, fb_url], (err) => {
    if (err) {
      return callback(new Error('Database error while adding new user'));
    }
    callback(null, 'New user added');
  });
};

module.exports = post;
