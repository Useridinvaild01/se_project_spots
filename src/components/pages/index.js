import Api from "../components/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "
"token":"28cdf155-072d-4fc2-b457-1ef64b70e181",
    "Content-Type": "application/json",
  },
});

// Test API
api.getUserInfo()
  .then((data) => {
    console.log("User info:", data);
  })
  .catch(console.error);

api.getInitialCards()
  .then((cards) => {
    console.log("Cards:", cards);
  })
  .catch(console.error);
