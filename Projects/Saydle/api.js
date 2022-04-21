const stats = document.querySelector(".stats");

const loginUser = (obj) => {
  return `
  mutation ADD_USER {
    insert_users_one(object: {name: "${obj.customFieldInputValues.Name}", user_id: "${obj.user_id}", created_on: "${obj.created_on}"}, on_conflict: {where: {}, constraint: users_pkey, update_columns: name}) {
        user_id
    }
  }`;
};

const getUser = (id) => {
  return `
  query GET_USER {
    users_by_pk(user_id: "${id}") {
        matches_played
        name
        score
    }
  }`;
};

const updateStats = (id, win) => {
  return `
  mutation UPDATE_STATS {
    update_users_by_pk(pk_columns: {user_id: "${id}"}, _inc: {matches_played: 1, score: ${win}}) {
        score
        matches_played
    }
  }`;
};

const fire = async (query) => {
  const response = await fetch("https://saydle.hasura.app/v1/graphql", {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret":
        "vwWr4W9F0YlLjwmpPktdAH4jI7a3peefSeeEFTBRlhAtDqMriCrlbTnLUmtffiS6",
    },
    body: JSON.stringify({
      query: query,
    }),
  });
  return await response.json();
};

const loggedIn = async () => {
  try {
    let obj = JSON.parse(sessionStorage.user);
    console.log(obj);
    let result = await fire(loginUser(obj));
    console.log(result);

    result = await fire(getUser(obj.user_id));
    obj = result.data.users_by_pk;
    console.log(obj);
    stats.textContent = `${obj.name.split(" ")[0]} has played ${
      obj.matches_played
    } matches so far with a total score of ${obj.score} !`;
  } catch (error) {
    console.log(error);
    window.location = "./login.html";
  }
};

loggedIn();
