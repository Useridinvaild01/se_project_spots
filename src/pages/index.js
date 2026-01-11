
import "./index.css";
import Api from "../utils/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "28cdf155-072d-4fc2-b457-1ef64b70e181",
    "Content-Type": "application/json",
  },
});


const profileNameEl = document.querySelector(".profile__name");
const profileAboutEl = document.querySelector(".profile__description");
const profileAvatarEl = document.querySelector(".profile__avatar"); // make sure this exists in HTML
const editProfileBtn = document.querySelector(".profile__edit-btn");
const addCardBtn = document.querySelector(".profile__add-btn");
const editAvatarBtn = document.querySelector(".profile__avatar-edit-btn"); // make sure this exists in HTML


const cardsList = document.querySelector(".cards__list");
const cardTemplate = document.querySelector("#card-template")?.content;


const editModal = document.querySelector(".modal_type_edit");
const addModal = document.querySelector(".modal_type_add");
const avatarModal = document.querySelector(".modal_type_avatar"); // make sure this exists in HTML
const deleteModal = document.querySelector(".modal_type_delete"); // make sure this exists in HTML
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


function setButtonLoading(button, isLoading, defaultText, loadingText) {
  if (!button) return;
  button.textContent = isLoading ? loadingText : defaultText;
}

function setProfile(user) {
  profileNameEl.textContent = user.name;
  profileAboutEl.textContent = user.about;
  if (profileAvatarEl) profileAvatarEl.src = user.avatar;
}

function getCardElement(cardData) {
  if (!cardTemplate) {
    console.error("Card template #card-template not found in HTML.");
    return document.createDocumentFragment();
  }

  const cardFragment = cardTemplate.cloneNode(true);

  const cardEl = cardFragment.querySelector(".card");
  const imgEl = cardFragment.querySelector(".card__image");
  const titleEl = cardFragment.querySelector(".card__title");
  const likeBtn = cardFragment.querySelector(".card__like-btn");
  const deleteBtn = cardFragment.querySelector(".card__delete-btn");

  
  imgEl.src = cardData.link;
  imgEl.alt = cardData.name;
  titleEl.textContent = cardData.name;


  if (cardData.isLiked) likeBtn.classList.add("card__like-btn_active");


  imgEl.addEventListener("click", () => {
    if (previewImage) previewImage.src = cardData.link;
    if (previewImage) previewImage.alt = cardData.name;
    if (previewCaption) previewCaption.textContent = cardData.name;
    openModal(previewModal);
  });


  likeBtn.addEventListener("click", () => {
    const isActive = likeBtn.classList.contains("card__like-btn_active");
    const request = isActive ? api.unlikeCard(cardData._id) : api.likeCard(cardData._id);

    request
      .then((updatedCard) => {
        if (updatedCard.isLiked) {
          likeBtn.classList.add("card__like-btn_active");
        } else {
          likeBtn.classList.remove("card__like-btn_active");
        }
      })
      .catch((err) => console.error(err));
  });

  deleteBtn.addEventListener("click", () => {
    selectedCardElement = cardEl;
    selectedCardId = cardData._id;
    openModal(deleteModal);
  });

  return cardFragment;
}

function renderCards(cards) {
  cardsList.innerHTML = "";
  cards.forEach((card) => {
    cardsList.append(getCardElement(card));
  });
}

function prependCard(card) {
  cardsList.prepend(getCardElement(card));
}

function handleEditProfileSubmit(evt) {
  evt.preventDefault();
  const submitBtn = editForm.querySelector(".modal__button");
  const defaultText = submitBtn.textContent;

  setButtonLoading(submitBtn, true, defaultText, "Saving...");

  api
    .updateUserInfo({ name: nameInput.value, about: aboutInput.value })
    .then((user) => {
      setProfile(user);
      closeModal(editModal);
    })
    .catch((err) => console.error(err))
    .finally(() => setButtonLoading(submitBtn, false, defaultText, "Saving..."));
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();
  const submitBtn = addForm.querySelector(".modal__button");
  const defaultText = submitBtn.textContent;

  setButtonLoading(submitBtn, true, defaultText, "Saving...");

  api
    .addCard({ name: cardTitleInput.value, link: cardLinkInput.value })
    .then((newCard) => {
      prependCard(newCard);
      addForm.reset();
      closeModal(addModal);
    })
    .catch((err) => console.error(err))
    .finally(() => setButtonLoading(submitBtn, false, defaultText, "Saving..."));
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();
  const submitBtn = avatarForm.querySelector(".modal__button");
  const defaultText = submitBtn.textContent;

  setButtonLoading(submitBtn, true, defaultText, "Saving...");

  api
    .updateAvatar({ avatar: avatarLinkInput.value })
    .then((user) => {
      setProfile(user);
      avatarForm.reset();
      closeModal(avatarModal);
    })
    .catch((err) => console.error(err))
    .finally(() => setButtonLoading(submitBtn, false, defaultText, "Saving..."));
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();
  const submitBtn = deleteForm.querySelector(".modal__button");
  const defaultText = submitBtn.textContent;

  setButtonLoading(submitBtn, true, defaultText, "Deleting...");

  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCardElement?.remove();
      selectedCardElement = null;
      selectedCardId = null;
      closeModal(deleteModal);
    })
    .catch((err) => console.error(err))
    .finally(() => setButtonLoading(submitBtn, false, defaultText, "Deleting..."));
}

setModalListeners();

editProfileBtn?.addEventListener("click", () => {
  if (nameInput) nameInput.value = profileNameEl.textContent;
  if (aboutInput) aboutInput.value = profileAboutEl.textContent;
  openModal(editModal);
});

addCardBtn?.addEventListener("click", () => {
  openModal(addModal);
});

editAvatarBtn?.addEventListener("click", () => {
  openModal(avatarModal);
});

editForm?.addEventListener("submit", handleEditProfileSubmit);
addForm?.addEventListener("submit", handleAddCardSubmit);
avatarForm?.addEventListener("submit", handleAvatarSubmit);
deleteForm?.addEventListener("submit", handleDeleteSubmit);


Promise.all([api.getUserInfo(), api.getInitialCards()])
  .then(([user, cards]) => {
    setProfile(user);
    renderCards(cards);
  })
  .catch((err) => console.error(err));
