/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Safely configure and instantiate GoogleGenAI
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
    console.log("Gemini API Client successfully initialized.");
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI client:", error);
  }
} else {
  console.log("No GEMINI_API_KEY supplied, falling back to local procedural engines.");
}

// 1. API: Custom AI Review of released electronic tracks
app.post("/api/generate-ai-review", async (req, res) => {
  const { title, primaryGenre, secondaryGenre, stats, artist, rating } = req.body;
  if (!title || !primaryGenre || !stats) {
    return res.status(400).json({ error: "Missing required track parameters" });
  }

  const genreStr = secondaryGenre ? `${primaryGenre} combined with ${secondaryGenre}` : primaryGenre;
  
  if (!ai) {
    // Return early fallback if API Key not set
    return res.json({
      review: `[Local Music Club] "A highly solid offering in ${primaryGenre}. The bass beats of '${title}' have nice momentum (Groove: ${stats.groove}/100, Sound Design: ${stats.soundDesign}/100) and represents a promising draft in the current city scene."`,
      isFallback: true
    });
  }

  try {
    const prompt = `Act as an elite, slightly pretentious music critic writing for an alternative underground electronic music outlet (like Resident Advisor or Mixmag). 
      Write a sharp, authentic, single-paragraph review of the track '${title}' by the bedroom producer artist '${artist}'.
      
      Track Specifications:
      - Main Genre Mixture: ${genreStr}
      - Sound Design Precision: ${stats.soundDesign}/100
      - Groove Dynamics: ${stats.groove}/100
      - Mixing & Mastering Clarity: ${stats.mixingQuality}/100
      - Catchiness & Melody: ${stats.catchiness}/100
      - Overall Track Vibe Rating: ${rating}/100
      
      The review scale should match the quality of the track: if track stats are low, be critical about budget bedroom loops/thin claps. 
      If stats are high, praise its subharmonic depth and modular warmth. Return strictly the text review. Limit to 100 words.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.85,
        systemInstruction: "You write authentic, immersive electronic music journalism. Use human-like slang (stems, floor-fillers, filters, white noise sweeps, analog warmth, bedroom clatter). Avoid generic, cheesy marketing filler words.",
      },
    });

    res.json({ review: response.text?.trim() || "A solid record that captures the scene's current vibe." });
  } catch (err: any) {
    console.error("Gemini review generation error:", err);
    res.json({
      review: `[Local Blogger] "The drum loops on '${title}' drive the groove cleanly, and the ${primaryGenre} synthesizers create an atmospheric feel. Solid mixing (Quality: ${stats.mixingQuality}/100). Ready for sub-club playback."`,
      isFallback: true
    });
  }
});

// 2. API: Dynamic Social Media Reactions Ticker
app.post("/api/generate-ai-social", async (req, res) => {
  const { title, primaryGenre, artist, rating } = req.body;
  const ratingNum = Number(rating) || 60;

  if (!ai) {
    // Quick procedural fallback
    return res.json({
      tweets: [
        `@DubstepHysteria: that drop in '${title}' by ${artist} literally destroyed my studio speakers!`,
        `@MauerparkRaver: heard someone spinning '${title}' in a Berlin basement last night. absolute vibe.`,
        `@SynthGearHead: sound design is interesting, but the mix feels a bit muddied on sub-woofers.`,
        `@RaveSpirit_26: pure bedroom nostalgia. we dancing tonight 🔊🔥`
      ],
      isFallback: true
    });
  }

  try {
    const prompt = `Generate exactly 4 realistic social media tweets or forum comments from electronic music fans reacting to the new track '${title}' by '${artist}' (Genre: ${primaryGenre}, overall quality: ${ratingNum}/100). 
      
      Return them as a JSON array of strings. Follow this array format strictly: ["comment 1", "comment 2", "comment 3", "comment 4"].
      - Some fans should be overexcited; others should be hardware-snobs complaining about 'digital synths' or 'sample packs' if the rating is mediocre.
      - Keep them short, casual, using rave terminology, hashtags, and lowercase slang (e.g. 'filthy bassline', 'rolling kicks', 'sidechain'). Do not write markdown blocks around the JSON array, just return the raw JSON array.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "Generate raw JSON arrays of strings corresponding to casual, realistic social media posts by electronic music enthusiasts. Do not use block quote markers.",
      },
    });

    const text = response.text?.trim() || "[]";
    const tweets = JSON.parse(text);
    res.json({ tweets });
  } catch (err) {
    console.error("Gemini social reactions error:", err);
    res.json({
      tweets: [
        `@ClubKid_99: putting '${title}' in my morning commute loop!`,
        `@EurorackNerd: clean bassline but the claps sound a bit stock.`,
        `@TechnoPurist: if you aren't spinning '${title}' in a booth this weekend what are you doing`,
        `@BedroomCrew: loving the experimental sounds on this, keep composing!`
      ],
      isFallback: true
    });
  }
});

// 3. API: Record Label contract DMs and executive messages
app.post("/api/generate-ai-emails", async (req, res) => {
  const { artist, prestige, genre, labelName } = req.body;

  if (!ai) {
    return res.json({
      email: `Hey ${artist},\n\nI was listening to your recent ${genre} project. Really impressive sound design for a self-released bedroom artist. Let's talk about signing a demo deal with ${labelName || "Subterranean Clicks"}. Let us know if you are interested!\n\nCheers,\nLabel Coordination Team`
    });
  }

  try {
    const prompt = `Act as an A&R Talent scout or record label owner of '${labelName || "a high-status label"}' writing a message to '${artist}', who has a career prestige ranking of ${prestige}/100.
      The message should be in the style of an off-duty A&R manager: either a casual Soundcloud direct message, or a crisp label introductory email.
      Focus heavily on the ${genre} genre and underground vs mainstream subcultures. Be quirky, perhaps a bit arrogant or incredibly eager to sign them depending on if they are highly popular. 
      Keep it brief, under 90 words.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.9,
      },
    });

    res.json({ email: response.text?.trim() });
  } catch (err) {
    res.json({
      email: `Yo ${artist}, saw your live clip doing ${genre} blends online. The energy looks epic. Reach out if you want to collaborate or do an official project under our publishing wings at ${labelName || "Subterranean Clicks"}.\n\nKeep shining!\n- Label scout`
    });
  }
});

// 4. API: Dynamic producer direct text chat
app.post("/api/generate-producer-chat", async (req, res) => {
  const { producer, message, playerPseudonym, playerPrestige } = req.body;

  if (!producer || !message) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }

  if (!ai) {
    return res.json({ response: null });
  }

  try {
    const prompt = `Act as ${producer.name}, an active electronic music producer in the scene, with the following profile:
      - Primary Genre: ${producer.primaryGenre}
      - Gender: ${producer.gender || "specified via character details"}
      - Pronouns: ${producer.pronouns || "they/them"}
      - Ego Level: ${producer.ego}/100 (high ego means they are highly pretentious, dismissive of beginners, and protective of their fame)
      - Relationship to Player: ${producer.relationship}/100 (-100 is bitter rival/enemy, +100 is close friend)
      - Career Fame: ${producer.fame}/100
      - Bio: ${producer.bio}
      
      You are direct messaging or texting on a mobile chat app with the player '${playerPseudonym}', who has an electronic music prestige rating of ${playerPrestige}/100 in the scene.
      
      The player sent you this exact message: "${message}"
      
      Write an authentic, highly realistic, single-paragraph text reply from ${producer.name} back to the player.
      Tone Guidelines:
      - Represent your specific gender presentation (${producer.gender}) and style. Female and non-binary characters might occasionally speak on fighting the industry's boys'-club gatekeepers, hosting safe-space collectives, or bringing progressive, authentic club curation to the scene, while male characters might express standard raver brotherly energy or elitist vinyl gatekeeping depending on their ego.
      - Adapt your tone perfectly to your relationship and ego. If relationship is low, be passive-aggressive, rude, or dismissive. If relationship is high, be helpful, warm, or cooperative.
      - If they flatter your gig or music, react with pride (or modest appreciation if low ego).
      - If they ask about gear or advice, give practical but slightly opinionated scene advice.
      - If they mock, shade, or insult you, snap back or act superior.
      - Keep the language ultra-realistic, casual, and scene-perfect (slang, lowercase/relaxed grammar is fine, reference music tech, synthesizers, vinyl, or club names if appropriate).
      - Limit your response to 80 words. Do not quote yourself and do not sign off with your name at the end. Just say the dialogue text directly.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.9,
        systemInstruction: "You are the character. Talk in first person directly in character. Avoid generic greeting introductions and avoid signing off with your name at the end of the text message.",
      }
    });

    res.json({ response: response.text?.trim() });
  } catch (err: any) {
    console.error("Gemini producer chat generation error:", err);
    res.json({ response: null });
  }
});

// 5. API: Dynamic shifting annual electronic trend
app.post("/api/generate-ai-trend", async (req, res) => {
  if (!ai) {
    return res.json({
      status: "skipped",
      trend: null
    });
  }

  try {
    const prompt = `Generate an exciting, highly fictional electronic music trend, phenomenon, controversy, or technological disruption of the current year.
      Provide a JSON object containing:
      - name: A short catchy title (e.g., "The Vinyl Pellets Shortage", "Glitchcore AI Takeover", "Modular Synth Retro Wave", "The 180BPM Warehouse Revival").
      - description: A short, engaging 80-word narrative of what is happening (e.g. warehouse club closures, viral social content trends, hardware synthesiser microchip shortages, pirate radio battles).
      - hotGenre: Pick one from: "Techno", "Trance", "House", "Drum & Bass", "Dubstep", "Synthwave", "Industrial", "Ambient", "Hardstyle", "Experimental".
      - decayingGenre: Pick another from that list that is becoming over-saturated or unfashionable.
      - source: The root of the trend (e.g. "TikTok Viral Loop", "Tokyo Club Scene", "London Underground Radio").
      
      Ensure your response is raw JSON matching this structure perfectly.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are a dynamic music event procedurals generator. Output accurate, clean JSON objects reflecting simulated Electronic Scene shifts.",
      },
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");
    res.json({ trend: parsed });
  } catch (err) {
    console.error("Gemini trend shift generator error:", err);
    res.json({ trend: null });
  }
});

// 6. API: Dynamic post-gig rave review & promoter report
app.post("/api/generate-ai-gig-review", async (req, res) => {
  const { venueName, energy, city, artist, rewardMoney, fansGained } = req.body;
  const energyNum = Number(energy) || 60;

  if (!ai) {
    const fallbacks = [
      `[Rave Report | ${city}] "${artist} took over ${venueName} and kept the floor alive! Absolute heat. Gained ${fansGained || 100} followers!"`,
      `[Local Promoter DM] "Wicked set, mate! People at ${venueName} were absolutely loving the groove selectors. Hit me up for the next slot."`,
      `[Scene Blog] "An atmospheric ride under the strobe lights of ${city}. ${artist} showed genuine crate-digging talent."`
    ];
    return res.json({
      review: fallbacks[Math.floor(Math.random() * fallbacks.length)]
    });
  }

  try {
    const prompt = `Act as an underground dance music blog reporter or a local club promoter reviewing the gig '${artist}' just played at the club '${venueName}' in the city of '${city}'.
      The DJ set ended with a crowd energy score of ${energyNum}/100 and collected $${rewardMoney || 0}.
      
      Requirements:
      - If energy is < 45, write a critical, slightly disappointed review of a lackluster show (e.g., mismatched BPM, technical errors, cold room).
      - If energy is 45-75, write a decent, solid review praising standard performance loops and nice vibe.
      - If energy is > 75, write an ecstatic, glowing review of a historic night with crazy strobe lights, massive drops, and roaring crowds.
      - Keep it short, authentic, and styled like music outlets (Resident Advisor style). Use raver slang. Return only the raw review text under 80 words.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.85,
        systemInstruction: "You write realistic, immersive, short electronic club reviews from promoters or raving journalists.",
      }
    });

    res.json({ review: response.text?.trim() || "A solid set that kept the party rolling into the morning hours." });
  } catch (err) {
    console.error("Gemini post-gig review error:", err);
    res.json({
      review: `[Local Zine] "${artist}'s appearance at ${venueName} in ${city} brought out the underground crowd. Solid transitions and robust energy throughout!"`
    });
  }
});

// 7. API: DAW Assistant - Creative Title Suggestions & Hardware Engineering tips
app.post("/api/generate-ai-daw-ideas", async (req, res) => {
  const { primaryGenre, secondaryGenre, currentBPM, stems } = req.body;
  const genreStr = secondaryGenre ? `${primaryGenre}/${secondaryGenre}` : primaryGenre;

  if (!ai) {
    // Quick fallback titles based on electronic aesthetics
    const randomWords = ["Decay", "Filter", "Hologram", "Frequency", "Subharmonic", "Rhythm", "Resonance", "Detroit", "Warehouse", "Acid", "Pulsar", "Static"];
    const w1 = randomWords[Math.floor(Math.random() * randomWords.length)];
    const w2 = randomWords[Math.floor(Math.random() * randomWords.length)];
    const titles = [
      `${w1} ${w2}`,
      `Spectral ${genreStr} Shift`,
      `The ${currentBPM || 135} BPM Project`
    ];
    return res.json({
      titles,
      instruction: `Tip: Try high-passing your stems at 150Hz to let your ${primaryGenre} subharmonic kicks thud clearly in the room space.`
    });
  }

  try {
    const prompt = `Generate exactly 3 highly creative, authentic, futuristic underground electronic music track titles for a ${genreStr} draft running at ${currentBPM || 130} BPM.
      Also provide 1 short, actionable, pro-level studio sound design/mixing tip (e.g. sidechain parameters, synth detuning, stereo fields, reverb tails) for this genre.
      
      Return as a JSON object matching this structure:
      {
        "titles": ["Title 1", "Title 2", "Title 3"],
        "instruction": "Your 1-sentence sound design tip here."
      }
      Do not wrap it in markdown block quotes, just output raw JSON text.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are an elite electronic music mastering engineer and creative director. Output only raw JSON.",
      }
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json({
      titles: data.titles || ["Analog Waves", "Digital Horizon", "BPM Override"],
      instruction: data.instruction || "Keep your sub frequencies in mono to preserve headlining club power."
    });
  } catch (err) {
    console.error("Gemini DAW assistant error:", err);
    res.json({
      titles: ["Subharmonic Voltage", "LFO Oscillation", "Modulation Path"],
      instruction: "Route your main lead synth into a subtle ping-pong delay to widen the stereo environment."
    });
  }
});

// 8. API: Dynamic Gear Shop Pitch
app.post("/api/generate-ai-gear-pitch", async (req, res) => {
  const { gearName, gearType, cost, studioBonus } = req.body;

  if (!ai) {
    return res.json({
      pitch: `The classic ${gearName} is an absolute staple! Increases your sound design parameters by +${studioBonus || 5} points. A bargain for any bedroom hardware collector.`
    });
  }

  try {
    const prompt = `Act as a quirky, passionate, absolute hardware-nerd sales representative at a vintage synthesizer store.
      Give an excited, 1-paragraph, 60-word sales recommendation/pitch for the gear item '${gearName}' (${gearType}) which costs $${cost} and grants a studio bonus of +${studioBonus}.
      
      Make it highly technical, referring to filters (LPF/HPF), voltage-controlled oscillators (VCO), analog tape saturations, vacuum tubes, or chips depending on what the gear is. Mention that it's an indispensable investment for a bedroom producer. Keep it authentic and highly engaging.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.9,
        systemInstruction: "You write as a passionate, quirky vintage music equipment enthusiast. Use rich music production jargon.",
      }
    });

    res.json({ pitch: response.text?.trim() || `The ${gearName} adds unmatched warmth to any amateur electronic workstation setup.` });
  } catch (err) {
    console.error("Gemini gear pitch error:", err);
    res.json({
      pitch: `The iconic ${gearName} synth module adds real-time wave-shaping versatility and analog depth to your overall studio production potential.`
    });
  }
});


// Mounting Vite middleware in development or serving static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Static production assets mounted from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
