import "./index.css";
import Api from "../utils/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "bf9e003a-3773-4da0-af1f-9d54c85d9ed3",
    "Content-Type": "application/json",
  },
});

const profileNameEl = document.querySelector(".profile__name");
const profileAboutEl = document.querySelector(".profile__description");
const profileAvatarEl = document.querySelector(".profile__avatar");
const editProfileBtn = document.querySelector(".profile__edit-btn");
const addCardBtn = document.querySelector(".profile__add-btn");
const editAvatarBtn = document.querySelector(".profile__avatar-edit-btn");

const cardsList = document.querySelector(".cards__list");
const cardTemplate = document.querySelector("#card-template")?.content;

const editModal = document.querySelector(".modal_type_edit");
const addModal = document.querySelector(".modal_type_add");
const avatarModal = document.querySelector(".modal_type_avatar");
const deleteModal = document.querySelector(".modal_type_delete");
const previewModal = document.querySelector("#image-preview-modal");

const closeButtons = document.querySelectorAll(".modal__close");

const editForm = editModal?.querySelector(".modal__form");
const nameInput = editForm?.querySelector("#profile-name");
const aboutInput = editForm?.querySelector("#profile-description");

const addForm = addModal?.querySelector(".modal__form");
const cardTitleInput = addForm?.querySelector("#card-title");
const cardLinkInput = addForm?.querySelector("#card-link");

const avatarForm = avatarModal?.querySelector(".modal__form");
const avatarLinkInput = avatarForm?.querySelector("#avatar-link");

const deleteForm = deleteModal?.querySelector(".modal__form");

const previewImage = previewModal?.querySelector(".modal__image");
const previewCaption = previewModal?.querySelector(".modal__caption");

let selectedCardElement = null;
let selectedCardId = null;

function handleEscClose(evt) {
  if (evt.key === "Escape") {
    const opened = document.querySelector(".modal_opened");
    if (opened) closeModal(opened);
  }
}

function openModal(modal) {
  if (!modal) return;
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscClose);
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscClose);
}

function setModalListeners() {
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.closest(".modal")));
  });

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("mousedown", (evt) => {
      if (evt.target === modal) closeModal(modal);
    });
  });
}

function setProfile(user) {
  profileNameEl.textContent = user.name;
  profileAboutEl.textContent = user.about;
  profileAvatarEl.src = user.avatar;
}

function getCardElement(cardData) {
  const cardFragment = cardTemplate.cloneNode(true);
  const cardEl = cardFragment.querySelector(".card");
  const imgEl = cardFragment.querySelector(".card__image");
  const titleEl = cardFragment.querySelector(".card__title");
  const likeBtn = cardFragment.querySelector(".card__like-btn");
  const deleteBtn = cardFragment.querySelector(".card__delete-btn");

  imgEl.src = cardData.link;
  imgEl.alt = cardData.name;
  titleEl.textContent = cardData.name;

  if (cardData.isLiked) {
    likeBtn.classList.add("card__like-btn_active");
  }

  imgEl.addEventListener("click", () => {
    previewImage.src = cardData.link;
    previewImage.alt = cardData.name;
    previewCaption.textContent = cardData.name;
    openModal(previewModal);
  });

  likeBtn.addEventListener("click", () => {
    const isLiked = likeBtn.classList.contains("card__like-btn_active");

    api.changeLikeCardStatus(cardData._id, !isLiked)
      .then((updatedCard) => {
        likeBtn.classList.toggle("card__like-btn_active", updatedCard.isLiked);
      })
      .catch(console.error);
  });

  deleteBtn.addEventListener("click", () => {
    selectedCardElement = cardEl;
    selectedCardId = cardData._id;
    openModal(deleteModal);
  });

  return cardFragment;
}

function renderCards(cards) {
  console.log("RENDER START");
  console.log("Cards received:", cards);
  console.log("Cards list:", cardsList);
  console.log("Card template:", cardTemplate);

  if (!cardsList) {
    console.error("ERROR: .cards__list was not found");
    return;
  }

  if (!cardTemplate) {
    console.error("ERROR: #card-template was not found");
    return;
  }

  cardsList.innerHTML = "";

  cards.forEach((card) => {
    console.log("Creating card:", card);

    const cardElement = getCardElement(card);

    console.log("Card created:", cardElement);

    cardsList.append(cardElement);
  });

  console.log("Cards rendered successfully");
}

function prependCard(card) {
  cardsList.prepend(getCardElement(card));
}

function handleEditProfileSubmit(evt) {
  evt.preventDefault();
  const submitBtn = editForm.querySelector(".modal__button");
  const defaultText = submitBtn.textContent;

  submitBtn.textContent = "Saving...";

  api.editUserInfo({ name: nameInput.value, about: aboutInput.value })
    .then((user) => {
      setProfile(user);
      closeModal(editModal);
    })
    .catch(console.error)
    .finally(() => {
      submitBtn.textContent = defaultText;
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  const submitBtn = addForm.querySelector(".modal__button");
  const defaultText = submitBtn.textContent;

  submitBtn.textContent = "Saving...";

  api.addCard({ name: cardTitleInput.value, link: cardLinkInput.value })
    .then((newCard) => {
      prependCard(newCard);
      addForm.reset();
      closeModal(addModal);
    })
    .catch(console.error)
    .finally(() => {
      submitBtn.textContent = defaultText;
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  const submitBtn = avatarForm.querySelector(".modal__button");
  const defaultText = submitBtn.textContent;

  submitBtn.textContent = "Saving...";

  api.updateAvatar({ avatar: avatarLinkInput.value })
    .then((user) => {
      setProfile(user);
      avatarForm.reset();
      closeModal(avatarModal);
    })
    .catch(console.error)
    .finally(() => {
      submitBtn.textContent = defaultText;
    });
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  const submitBtn = deleteForm.querySelector(".modal__button");
  const defaultText = submitBtn.textContent;

  submitBtn.textContent = "Deleting...";

  api.removeCard(selectedCardId)
    .then(() => {
      selectedCardElement?.remove();
      selectedCardElement = null;
      selectedCardId = null;
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      submitBtn.textContent = defaultText;
    });
}

setModalListeners();

editProfileBtn.addEventListener("click", () => {
  nameInput.value = profileNameEl.textContent;
  aboutInput.value = profileAboutEl.textContent;
  openModal(editModal);
});

addCardBtn.addEventListener("click", () => openModal(addModal));
editAvatarBtn.addEventListener("click", () => openModal(avatarModal));

editForm.addEventListener("submit", handleEditProfileSubmit);
addForm.addEventListener("submit", handleAddCardSubmit);
avatarForm.addEventListener("submit", handleAvatarSubmit);
deleteForm.addEventListener("submit", handleDeleteSubmit);



Promise.all([api.getUserInfo(), api.getInitialCards()])
  .then(([user, cards]) => {
    console.log("BEFORE RENDER");
    console.log("USER:", user);
    console.log("CARDS:", cards);

    setProfile(user);

    console.log("CALLING RENDER");
    renderCards(cards);
  })
  .catch((err) => {
    console.error("API ERROR:", err);
  });