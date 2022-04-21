import { dictionary } from "./dictionary.js";
import { targetWords } from "./targetWords.js";
const WORD_LENGTH = 5;
const alertContainer = document.querySelector("[data-alert-container]");
const guessGrid = document.querySelector("[data-guess-grid]");

//new word every day
const offsetFromDate = new Date(2022, 0, 1);
const msOffset = Date.now() - offsetFromDate;
const dayOffset = msOffset / 1000 / 60 / 60 / 24;
const targetWord = targetWords[Math.floor(dayOffset)];

//stt
const obj = document.querySelector(".record");
const captions = document.querySelector(".captions");

const showAlert = (message, duration = 1000) => {
  const alert = document.createElement("div");
  alert.textContent = message;
  alert.classList.add("alert");
  alertContainer.prepend(alert);
  if (duration == null) return;

  setTimeout(() => {
    alert.classList.add("hide");
    alert.addEventListener("transitionend", () => {
      alert.remove();
    });
  }, duration);
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

const checkWinLose = async (guess) => {
  if (guess === targetWord) {
    showAlert("You Win", 5000);
    let obj = JSON.parse(sessionStorage.user);
    await fire(updateStats(obj.user_id, 1));
    return;
  }
  const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])");
  if (remainingTiles.length === 0) {
    showAlert(targetWord.toUpperCase(), null);
    let obj = JSON.parse(sessionStorage.user);
    await statsUpdate(obj.user_id, 0);
  }
};

const reflectChanges = (word) => {
  const activeTiles = guessGrid.querySelectorAll('[data-state="active"]');
  activeTiles.forEach((tile, index, array) => {
    const letter = tile.dataset.letter;
    if (targetWord[index] === letter) {
      tile.dataset.state = "correct";
    } else if (targetWord.includes(letter)) {
      tile.dataset.state = "wrong-location";
    } else {
      tile.dataset.state = "wrong";
    }
    if (index === array.length - 1) checkWinLose(word);
  });
};

const enterWord = (word) => {
  let nextTile = guessGrid.querySelector(":not([data-letter])");
  for (let i = 0; i < word.length; i++) {
    const key = word[i];
    nextTile.dataset.letter = key.toLowerCase();
    nextTile.textContent = key.toUpperCase();
    nextTile.dataset.state = "active";
    nextTile = nextTile.nextElementSibling;
  }
  reflectChanges(word);
};

const stt = async () => {
  obj.removeEventListener("click", stt);
  obj.children[1].textContent = "Stop";
  console.log("Started");
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    if (!MediaRecorder.isTypeSupported("audio/webm"))
      return alert("Browser not supported");
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    const socket = new WebSocket("wss://api.deepgram.com/v1/listen", [
      "token",
      "e737544406eed083961c0431947d8b11f0b2593e",
    ]);
    socket.onopen = () => {
      obj.addEventListener("click", () => socket.close());
      mediaRecorder.addEventListener("dataavailable", async (event) => {
        if (event.data.size > 0 && socket.readyState == 1) {
          socket.send(event.data);
        }
      });
      mediaRecorder.start(1000);
    };
    socket.onmessage = (message) => {
      const received = JSON.parse(message.data);
      const output = received.channel.alternatives[0];
      const transcript = output.transcript;
      if (transcript && received.is_final) {
        captions.textContent = transcript;
        const word = output.words[0].word;
        if (word.length != WORD_LENGTH) {
          showAlert(
            `Word should be exactly equal to ${WORD_LENGTH} characters`
          );
        } else if (!dictionary.includes(word)) {
          showAlert("Word not in dictionary");
        } else {
          enterWord(word);
        }
      }
    };
    socket.onclose = () => {
      stream.getTracks().forEach((track) => {
        if (track.readyState == "live" && track.kind === "audio") {
          track.stop();
        }
      });
      obj.removeEventListener("click", () => socket.close());
      obj.children[1].textContent = "Record";
      captions.textContent = "";
      obj.addEventListener("click", stt);
      console.log({ event: "onclose" });
    };
    socket.onerror = (error) => {
      console.log({ event: "onerror", error });
    };
  });
};

obj.addEventListener("click", stt);
