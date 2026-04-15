// Simple navigation with fade animation
function navigateTo(page) {
  const body = document.body;
  body.classList.add("page-fade-out");
  setTimeout(() => {
    window.location.href = page;
  }, 120);
}

// Scroll to emergency section on home
function scrollToEmergency() {
  const el = document.getElementById("emergencySection");
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Initialize per-page features
document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("page-fade-in");

  const page = document.body.dataset.page;
  if (page === "crops") initCrops();
  if (page === "chat") initChat();
  if (page === "schemes") initSchemes();
  if (page === "water") initWater();
  if (page === "weather") initWeather();
  if (page === "disease") initDisease();
  if (page === "home") initHomeWeather();
});

/* --------- Home (small demo weather) ---------- */

function initHomeWeather() {
  // Static demo data
  const temp = "30°C";
  const cond = "Sunny";
  const humidity = "55%";
  const rain = "20%";

  const miniTemp = document.getElementById("miniTemp");
  const hTemp = document.getElementById("homeWeatherTemp");
  const hCond = document.getElementById("homeWeatherCond");
  const hHum = document.getElementById("homeWeatherHumidity");
  const hRain = document.getElementById("homeWeatherRain");

  if (miniTemp) miniTemp.textContent = temp;
  if (hTemp) hTemp.textContent = temp;
  if (hCond) hCond.textContent = cond;
  if (hHum) hHum.textContent = humidity;
  if (hRain) hRain.textContent = rain;
}

/* --------- Crops ---------- */

const cropsData = [
  {
    name: "Wheat",
    emoji: "🌾",
    desc: "Major Rabi crop suitable for cool climate.",
    temp: "10–25°C",
    water: "4–6 irrigations, avoid waterlogging.",
    fert: "Balanced NPK, FYM before sowing."
  },
  {
    name: "Rice (Paddy)",
    emoji: "🌱",
    desc: "Kharif crop requiring standing water.",
    temp: "20–35°C",
    water: "Continuous moisture, puddled fields.",
    fert: "Nitrogen in splits, zinc in deficient soils."
  },
  {
    name: "Cotton",
    emoji: "🧵",
    desc: "Long duration cash crop.",
    temp: "21–30°C",
    water: "Requires regular irrigation, avoid stress.",
    fert: "High N and K demand, soil test based."
  },
  {
    name: "Tomato",
    emoji: "🍅",
    desc: "Popular vegetable for all seasons.",
    temp: "18–27°C",
    water: "Frequent light irrigations, avoid cracking.",
    fert: "Rich in organic matter, NPK and micronutrients."
  },
  {
    name: "Maize",
    emoji: "🌽",
    desc: "Cereal crop grown in Kharif/Rabi.",
    temp: "21–27°C",
    water: "Sensitive to moisture at tasseling and grain filling.",
    fert: "High nitrogen requirement in splits."
  }
];

function initCrops() {
  const list = document.getElementById("cropList");
  if (!list) return;
  renderCrops(cropsData);
}

function renderCrops(data) {
  const list = document.getElementById("cropList");
  list.innerHTML = "";
  data.forEach(crop => {
    const card = document.createElement("article");
    card.className = "card crop-card";
    card.innerHTML = `
      <div class="crop-img">${crop.emoji}</div>
      <div class="crop-body">
        <h3>${crop.name}</h3>
        <p>${crop.desc}</p>
        <div class="crop-meta">
          <div><strong>Temp:</strong> ${crop.temp}</div>
          <div><strong>Irrigation:</strong> ${crop.water}</div>
          <div><strong>Fertilizer:</strong> ${crop.fert}</div>
        </div>
      </div>
    `;
    list.appendChild(card);
  });
}

function filterCrops() {
  const q = (document.getElementById("cropSearch").value || "").toLowerCase();
  const filtered = cropsData.filter(c => c.name.toLowerCase().includes(q));
  renderCrops(filtered);
}

/* --------- Chat Assistant (demo AI) ---------- */

let recognition;

function initChat() {
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new Rec();
    recognition.lang = "hi-IN";
    recognition.onresult = e => {
      const text = e.results[0][0].transcript;
      const input = document.getElementById("chatInput");
      input.value = text;
    };
  }
}

function chatQuick(text) {
  const input = document.getElementById("chatInput");
  input.value = text;
  sendChatMessage();
}
// async function analyzeViaApi(query) {
//   try {
//     const res = await fetch("https://your-api.com/krishimitra/analyze", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({ query })
//     });
//     if (!res.ok) {
//       throw new Error("API error " + res.status);
//     }
//     return await res.json();
//   } catch (err) {
//     console.error("AI API error:", err);
//     return null;
//   }
// 
// Gemini API call (frontend – key will be visible in browser)
// async function analyzeViaApi(query) {
//   const API_KEY = "null";
//   try {
//     const res = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${null}`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           contents: [
//             {
//               parts: [
//                 {
//                   text:
//                     "You are KrishiMitra, a friendly agriculture assistant for Indian farmers. " +
//                     "Answer briefly and clearly in simple language.\n\n" +
//                     "Farmer question: " +
//                     query
//                 }
//               ]
//             }
//           ]
//         })
//       }
//     );

//     const data = await res.json();
//     console.log("Gemini raw response:", res.status, data);

//     if (!res.ok) {
//       // Return error message so UI can show it
//       return `API error ${res.status}: ${data.error?.message || "Unknown error"}`;
//     }

//     const text =
//       data.candidates &&
//       data.candidates[0] &&
//       data.candidates[0].content &&
//       data.candidates[0].content.parts
//         .map(p => p.text || "")
//         .join("\n");

//     return text || "AI returned empty response.";
//   } catch (err) {
//     console.error("Gemini API error:", err);
//     return "Network or CORS error when calling Gemini.";
//   }
// }
// async function analyzeViaApi(query) {
//   const API_KEY = "null";

//       try {
//       const res = await fetch(
//       "https://api.groq.com/openai/v1/chat/completions",
//       {
//         method: "POST",
//         headers: {
//           "Authorization": `Bearer ${API_KEY}`,
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           model: "llama3-8b-8192",
//           messages: [
//             {
//               role: "system",
//               content: "You are KrishiMitra, a friendly agriculture assistant for Indian farmers. Answer briefly in simple language."
//             },
//             {
//               role: "user",
//               content: query
//             }
//           ]
//         })
//       }
//     );

//     const data = await res.json();
//     console.log(data);
//   } catch (err) {
//     console.error(err);
//   }
// }
// async function analyzeViaApi(query) {
//   const API_KEY = "new_api key"; // ⚠️ Replace with NEW key

//   try {
//     const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${API_KEY}`,
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         model: "llama-3.3-70b-specdec",
//         messages: [
//           {
//             role: "system",
//             content: "You are KrishiMitra, a friendly agriculture assistant for Indian farmers. Answer briefly in simple language."
//           },
//           {
//             role: "user",
//             content: query
//           }
//         ]
//       })
//     });

//     const data = await res.json();

//     // 🔍 Show full response for debugging
//     console.log("API RESPONSE:", data);

//     // ❌ Handle API error properly
//     if (!res.ok) {
//       return "API Error: " + (data.error?.message || "Unknown error");
//     }

//     // ✅ Return actual AI response
//     return data.choices[0].message.content;

//   } catch (err) {
//     console.error("FETCH ERROR:", err);
//     return "Network error or API issue";
//   }
// }

// async function analyzeViaApi(query) {
//   const API_KEY = "APIkey";

//   try {
//     const res = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           contents: [
//             {
//               parts: [
//                 {
//                   text:
//                     "You are KrishiMitra, a friendly agriculture assistant for Indian farmers. Answer briefly in simple language.\n\nFarmer question: " +
//                     query
//                 }
//               ]
//             }
//           ]
//         })
//       }
//     );

//     const data = await res.json();
//     console.log("API RESPONSE:", data);

//     if (!res.ok) {
//       return "API Error: " + (data.error?.message || "Unknown error");
//     }

//     return data.candidates[0].content.parts[0].text;

//   } catch (err) {
//     console.error("ERROR:", err);
//     return "Network error or API issue";
//   }
// }
// 
// async function analyzeViaApi(query) {
//   const API_KEY = "null";

//   try {
//     const res = await fetch(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${API_KEY}`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           contents: [
//             {
//               parts: [
//                 {
//                   text: query
//                 }
//               ]
//             }
//           ]
//         })
//       }
//     );

//     const data = await res.json();
//     console.log("API RESPONSE:", data);

//     if (!res.ok) {
//       return "API Error: " + (data.error?.message || "Unknown error");
//     }

//     return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

//   } catch (err) {
//     console.error("ERROR:", err);
//     return "Network error";
//   }
// }
async function analyzeViaApi(query) {
  const API_KEY = "API_KEY_HERE";

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [
          {
            role: "system",
            content: "You are KrishiMitra, a friendly agriculture assistant for Indian farmers. Answer briefly in simple language."
          },
          {
            role: "user",
            content: query
          }
        ]
      })
    });

    const data = await res.json();
    console.log("API RESPONSE:", data);

    if (!res.ok) {
      return "API Error: " + (data.error?.message || "Unknown error");
    }

    return data.choices[0].message.content;

  } catch (err) {
    console.error("ERROR:", err);
    return "Network error";
  }
}
async function sendChatMessage() {
  const input = document.getElementById("chatInput");
  const value = input.value.trim();
  if (!value) return;

  const chatWindow = document.getElementById("chatWindow");

  const userBubble = document.createElement("div");
  userBubble.className = "chat-bubble user";
  userBubble.textContent = value;
  chatWindow.appendChild(userBubble);
  input.value = "";

  const loadingBubble = document.createElement("div");
  loadingBubble.className = "chat-bubble bot";
  loadingBubble.textContent = "Thinking…";
  chatWindow.appendChild(loadingBubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  const replyText = await analyzeViaApi(value);
  chatWindow.removeChild(loadingBubble);

  const botBubble = document.createElement("div");
  botBubble.className = "chat-bubble bot";

  if (!replyText) {
    botBubble.textContent =
      "Sorry, I could not reach the AI service right now. Please check internet/API key.";
  } else {
    botBubble.textContent = replyText;
  }

  chatWindow.appendChild(botBubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}
function generateDemoResponse(question) {
  const lower = question.toLowerCase();

  if (lower.includes("price") || lower.includes("market")) {
    return "Demo market info: Wheat – ₹2200/quintal, Paddy – ₹1900/quintal. Please check nearest mandi for exact rates.";
  }
  if (lower.includes("disease") || lower.includes("spots") || lower.includes("yellow")) {
    return "From your message it seems like nutrient deficiency or fungal disease. Keep leaves photo ready and contact local Krishi advisor. Avoid over-irrigation and spray recommended fungicide.";
  }
  if (lower.includes("scheme") || lower.includes("subsidy") || lower.includes("yojana")) {
    return "You may be eligible for PM-KISAN and crop insurance schemes. Open the Government Schemes tab to see details and check eligibility.";
  }

  return "Thanks for your question! As this is a demo, I suggest: check soil moisture before irrigation, use balanced fertilizer based on soil test, and watch for pests after heavy rain. For detailed answer, contact nearby agriculture officer.";
}

function startVoiceInput() {
  if (!recognition) {
    alert("Voice input is not supported in this browser. Please type your question.");
    return;
  }
  recognition.start();
}

function handleChatImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const chatWindow = document.getElementById("chatWindow");
  const bubble = document.createElement("div");
  bubble.className = "chat-bubble user";
  bubble.textContent = "📷 Photo uploaded (demo) – AI will use this for better suggestions in real app.";
  chatWindow.appendChild(bubble);
}

/* --------- Disease page (demo AI-style result) ---------- */

function initDisease() {
  // nothing special yet
}

function handleDiseaseImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const describe = document.getElementById("diseaseDescribe");
  describe.value += (describe.value ? "\n" : "") + "Photo attached for analysis.";
}
async function analyzeDisease() {
  const text = (document.getElementById("diseaseDescribe").value || "").toLowerCase();
  const resultSection = document.getElementById("diseaseResult");
  const content = document.getElementById("diseaseContent");

  if (!text) return;

  const res = await analyzeQueryFrontend(text);

  let html = "";
  if (res.detected_crop) {
    html += `<p><strong>Detected crop:</strong> ${res.detected_crop}</p>`;
  }
  if (res.detected_disease) {
    html += `<p><strong>Likely disease:</strong> ${res.detected_disease} (${res.confidence_score} match)</p>`;
  } else {
    html += `<p><strong>Disease:</strong> Not confidently detected (demo result).</p>`;
  }
  if (res.suggested_medicine) {
    html += `<p><strong>Suggested medicine:</strong> ${res.suggested_medicine}</p>`;
  }
  if (res.fertilizer_recommendation) {
    html += `<p><strong>Fertilizer suggestion:</strong> ${res.fertilizer_recommendation}</p>`;
  }
  if (res.prevention_steps && res.prevention_steps.length) {
    html += `<p><strong>Prevention steps:</strong></p><ul>`;
    res.prevention_steps.forEach(step => {
      html += `<li>${step}</li>`;
    });
    html += `</ul>`;
  }
  if (res.relevant_schemes && res.relevant_schemes.length) {
    html += `<p><strong>Relevant schemes:</strong></p><ul>`;
    res.relevant_schemes.forEach(s => {
      html += `<li>${s.scheme_name_en} / ${s.scheme_name_hi}</li>`;
    });
    html += `</ul>`;
  }

  content.innerHTML = html;
  resultSection.hidden = false;
}

/* --------- Schemes ---------- */

function initSchemes() {
  // nothing special yet
}

function switchSchemeTab(tab) {
  const central = document.getElementById("centralSchemes");
  const state = document.getElementById("stateSchemes");
  const tabs = document.querySelectorAll(".tab");

  tabs.forEach(t => t.classList.remove("active"));
  document.querySelector(`.tab[data-tab="${tab}"]`).classList.add("active");

  if (tab === "central") {
    central.hidden = false;
    state.hidden = true;
  } else {
    central.hidden = true;
    state.hidden = false;
  }
}

function checkEligibility(e) {
  e.preventDefault();
  const land = parseFloat(document.getElementById("eligLand").value || "0");
  const type = document.getElementById("eligType").value;
  const state = document.getElementById("eligState").value;
  const result = document.getElementById("eligResult");

  let messages = [];
  if (land <= 2 && type === "small") {
    messages.push("You look eligible for small farmer income support schemes like PM-KISAN.");
  } else {
    messages.push("You may still be eligible for crop insurance and irrigation subsidies.");
  }
  messages.push(`Please check specific rules for your state: ${state}.`);

  result.textContent = messages.join(" ");
}

/* --------- Water / Irrigation ---------- */

function initWater() {
  // nothing special yet
}

function calculateWater(e) {
  e.preventDefault();

  const land = parseFloat(document.getElementById("waterLand").value || "0");
  const crop = document.getElementById("waterCrop").value;
  const soil = document.getElementById("waterSoil").value;

  if (!land || land <= 0) return;

  let baseLitersPerAcre;
  switch (crop) {
    case "rice":
      baseLitersPerAcre = 25000;
      break;
    case "cotton":
      baseLitersPerAcre = 18000;
      break;
    case "vegetables":
      baseLitersPerAcre = 15000;
      break;
    default:
      baseLitersPerAcre = 12000;
  }

  let soilFactor = 1;
  if (soil === "sandy") soilFactor = 1.2;
  if (soil === "clay") soilFactor = 0.8;

  const totalLitersWeek = Math.round(baseLitersPerAcre * land * soilFactor);
  const textAmount = `Recommended water: approximately ${totalLitersWeek.toLocaleString()} liters per week for your field.`;

  const schedule = `Irrigation schedule: ${
    crop === "rice"
      ? "light continuous flooding, maintain 2–5 cm standing water."
      : "2–3 irrigations per week depending on rainfall and soil moisture."
  }`;

  const section = document.getElementById("waterResultSection");
  document.getElementById("waterAmount").textContent = textAmount;
  document.getElementById("waterSchedule").textContent = schedule;

  const ideal = baseLitersPerAcre * land;
  const ratio = totalLitersWeek / ideal;
  const percent = Math.round(Math.min(Math.max(ratio * 100, 40), 160));
  const bar = document.getElementById("waterBarFill");
  const label = document.getElementById("waterBarLabel");
  bar.style.width = `${Math.min(percent, 100)}%`;
  label.textContent = `Usage level: ${percent}% of ideal requirement (demo).`;

  const tipsEl = document.getElementById("waterTips");
  tipsEl.innerHTML = "";
  const tips = [
    "Use drip or sprinkler instead of flood irrigation wherever possible.",
    "Irrigate during early morning or evening to reduce evaporation loss.",
    "Mulch the soil using straw or crop residues to hold moisture.",
    "Check soil moisture by hand before every irrigation."
  ];
  tips.forEach(t => {
    const li = document.createElement("li");
    li.textContent = t;
    tipsEl.appendChild(li);
  });

  section.hidden = false;
}

/* --------- Weather page (static demo) ---------- */

function initWeather() {
  const temp = "30°C";
  const cond = "Sunny";
  const humidity = "55%";
  const rain = "20%";
  const wind = "8 km/h";

  const dTemp = document.getElementById("detailTemp");
  const dCond = document.getElementById("detailCond");
  const dHum = document.getElementById("detailHumidity");
  const dRain = document.getElementById("detailRain");
  const dWind = document.getElementById("detailWind");

  if (dTemp) dTemp.textContent = temp;
  if (dCond) dCond.textContent = cond;
  if (dHum) dHum.textContent = humidity;
  if (dRain) dRain.textContent = rain;
  if (dWind) dWind.textContent = wind;
}

/* --------- Small page fade animation ---------- */

document.addEventListener("animationend", e => {
  if (e.animationName === "pageFadeIn") {
    document.body.classList.remove("page-fade-in");
  }
});

// Inject CSS keyframes for fade animations
const style = document.createElement("style");
style.textContent = `
  @keyframes pageFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pageFadeOut { from { opacity: 1; } to { opacity: 0; transform: translateY(6px); } }
  body.page-fade-in .app-shell { animation: pageFadeIn 0.18s ease-out; }
  body.page-fade-out .app-shell { animation: pageFadeOut 0.18s ease-in forwards; }
`;
document.head.appendChild(style);



////profile page


/* --------- Profile / Auth (demo only) ---------- */

function switchAuthTab(tab) {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const tabs = document.querySelectorAll(".tabs .tab");
  tabs.forEach(t => t.classList.remove("active"));
  document.querySelector(`.tabs .tab[data-tab="${tab}"]`).classList.add("active");

  if (tab === "login") {
    loginForm.hidden = false;
    signupForm.hidden = true;
  } else {
    loginForm.hidden = true;
    signupForm.hidden = false;
  }

  const msg = document.getElementById("authMessage");
  if (msg) msg.textContent = "";
}

function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById("signupName").value.trim();
  const village = document.getElementById("signupVillage").value.trim();
  const mobile = document.getElementById("signupMobile").value.trim();
  const type = document.getElementById("signupType").value;

  const farmer = { name, village, mobile, type };
  localStorage.setItem("kisanProfile", JSON.stringify(farmer));

  const msg = document.getElementById("authMessage");
  msg.textContent = "Signup successful! You can now login with your mobile number (demo only).";

  // Switch to login tab for demo flow
  switchAuthTab("login");
}

function handleLogin(e) {
  e.preventDefault();
  const mobile = document.getElementById("loginMobile").value.trim();
  const password = document.getElementById("loginPassword").value.trim(); // not actually used

  const stored = localStorage.getItem("kisanProfile");
  const msg = document.getElementById("authMessage");

  if (!stored) {
    msg.textContent = "No account found in this browser. Please sign up first.";
    return;
  }

  const farmer = JSON.parse(stored);
  if (farmer.mobile === mobile) {
    msg.textContent = `Welcome back, ${farmer.name}! (Demo login – no real authentication)`;
  } else {
    msg.textContent = "Mobile number does not match saved farmer profile on this device.";
  }
}

function showDemoProfile() {
  const stored = localStorage.getItem("kisanProfile");
  const el = document.getElementById("profilePreview");
  if (!stored) {
    el.textContent = "No profile saved yet. Please sign up first.";
    return;
  }
  const farmer = JSON.parse(stored);
  el.innerHTML = `
    <p><strong>Name:</strong> ${farmer.name}</p>
    <p><strong>Village:</strong> ${farmer.village}</p>
    <p><strong>Mobile:</strong> ${farmer.mobile}</p>
    <p><strong>Farmer Type:</strong> ${farmer.type}</p>
  `;
}