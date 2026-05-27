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
  console.log(`[API DEBUG] Received request for AI review: title="${title}", primaryGenre="${primaryGenre}", rating=${rating}`);
  
  if (!title || !primaryGenre || !stats) {
    console.log("[API DEBUG] Missing required parameters for AI review request");
    return res.status(400).json({ error: "Missing required track parameters" });
  }

  const genreStr = secondaryGenre ? `${primaryGenre} combined with ${secondaryGenre}` : primaryGenre;
  
  if (!ai) {
    console.log("[API DEBUG] Gemini AI not initialized, using fallback for review");
    // Return early fallback if API Key not set
    return res.json({
      review: `[Local Music Club] "A highly solid offering in ${primaryGenre}. The bass beats of '${title}' have nice momentum (Groove: ${stats.groove}/100, Sound Design: ${stats.soundDesign}/100) and represents a promising draft in the current city scene."`,
      isFallback: true
    });
  }

  try {
    console.log("[API DEBUG] Calling Gemini AI for review generation");
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
        systemInstruction: "You write authentic, immersive electronic music journalism. Use human-like slang (stems, floor-filters, filters, white noise sweeps, analog warmth, bedroom clatter). Avoid generic, cheesy marketing filler words.",
      },
    });

    const reviewText = response.text?.trim() || "A solid record that captures the scene's current vibe.";
    console.log(`[API DEBUG] Successfully generated AI review (length: ${reviewText.length} chars)`);
    res.json({ review: reviewText });
  } catch (err: any) {
    console.error("[API DEBUG] Gemini review generation error:", err);
    console.log("[API DEBUG] Falling back to local review generation");
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

// 9. API: Dynamic Scene News Generation
app.post("/api/generate-ai-scene-news", async (req, res) => {
  const { currentGenre, playerPrestige, hotTopic, sceneCity } = req.body;
  
  if (!ai) {
    const fallbacks = [
      `The underground ${currentGenre || 'techno'} scene in ${sceneCity || 'Berlin'} is heating up! New labels popping up every month.`,
      `Industry insiders predict a major shift towards ${currentGenre || 'electronic music'} in the coming months.`,
      `The ${sceneCity || 'underground'} club circuit is buzzing with excitement over new talent emerging.`,
      `Major festival organizers reportedly scouting artists from the ${currentGenre || 'underground'} scene.`
    ];
    return res.json({
      headline: fallbacks[Math.floor(Math.random() * fallbacks.length)],
      body: `This could be a pivotal moment for ${currentGenre || 'electronic music'} artists everywhere.`,
      isFallback: true
    });
  }

    try {
      const prompt = `You are writing breaking news for an underground electronic music scene blog.
        Generate 1 exciting news headline (short, punchy, max 8 words) and a detailed news paragraph (2-3 sentences) about what's happening in the ${currentGenre || 'electronic music'} scene right now.
        
        Context:
        - Player prestige level: ${playerPrestige || 25}/100
        - Hot topic: ${hotTopic || 'new artist breakthrough'}
        - Scene city: ${sceneCity || 'Berlin'}
        
        Return as JSON:
        {
          "headline": "Your exciting headline here (max 8 words)",
          "body": "2-3 sentence news paragraph with scene details, including specific venues, artists, or events"
        }
        Keep it authentic, use underground music slang, mention specific venues or events. Output raw JSON only.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.85,
        systemInstruction: "You write authentic, engaging underground electronic music scene journalism."
      }
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json({ 
      headline: data.headline || "Scene heating up!",
      body: data.body || "New releases flooding the underground market.",
      isFallback: false
    });
  } catch (err) {
    console.error("Gemini scene news error:", err);
    res.json({
      headline: `The underground scene is evolving rapidly`,
      body: "Major shifts happening in the electronic music landscape.",
      isFallback: true
    });
  }
});

// 10. API: Dynamic Forum Discussion
app.post("/api/generate-ai-forum-post", async (req, res) => {
  const { category, currentGenre, playerName } = req.body;
  
  const categoryContext: Record<string, string> = {
    tech: "gear, production techniques, DAW discussions",
    scene: "live events, club culture, underground parties",
    gossip: "artist drama, label controversies, industry rumors",
    drama: "heated debates about music authenticity, scene gatekeeping",
    tips: "production advice, mixing techniques, workflow improvements"
  };

  if (!ai) {
    const fallbacks: Record<string, { title: string; content: string }> = {
      tech: { 
        title: "What's your go-to bass processing chain?",
        content: "Been experimenting with OTT + LFO tool + SaaS. Curious what combinations work best for that punchy sub-bass sound everyone's going for in 2026."
      },
      scene: { 
        title: "Best underground venues in 2026?",
        content: "With so many venues closing, where are the real underground parties happening now? Looking for intimate warehouse vibes with proper sound systems."
      },
      gossip: { 
        title: "Major label drama brewing",
        content: "Hearing whispers about a big underground artist potentially signing with one of the major EDM networks. Could change everything for their sound."
      },
      drama: { 
        title: "Is digital production killing authenticity?",
        content: "Hot take: most bedroom producers have no idea what real analog warmth sounds like. The over-reliance on plugins is making everything sound samey."
      },
      tips: { 
        title: "Sidechain secrets for cleaner mixes",
        content: "Finally figured out that 1/16 note sidechain with subtle attack release gives that pumping without killing the low-end. Anyone else doing this?"
      }
    };
    const post = fallbacks[category] || fallbacks.tips;
    return res.json({
      title: post.title,
      content: post.content,
      isFallback: true
    });
  }

  try {
    const prompt = `Generate an authentic underground electronic music forum discussion post.
      
      Category: ${category || 'tech'} - ${categoryContext[category] || 'general discussion'}
      Popular genre: ${currentGenre || 'techno'}
      Original poster: ${playerName || 'Anonymous Producer'}
      
      Return as JSON:
      {
        "title": "Catchy discussion title (max 80 chars)",
        "content": "2-3 paragraph forum post with authentic discussion starter content"
      }
      
      Use realistic forum tone - passionate, sometimes opinionated, using underground slang. Mix technical terms with casual language. Output raw JSON only.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.9,
        systemInstruction: "You write realistic underground electronic music forum posts."
      }
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json({
      title: data.title || "What's everyone working on?",
      content: data.content || "Drop your latest projects in the thread.",
      isFallback: false
    });
  } catch (err) {
    console.error("Gemini forum post error:", err);
    res.json({
      title: "Production question thread",
      content: "Anyone else struggling with the same mixing challenges?",
      isFallback: true
    });
  }
});

// 11. API: Dynamic Social Feed Posts
app.post("/api/generate-ai-social-feed", async (req, res) => {
  const { artistName, genre, mood, recentActivity } = req.body;
  
  if (!ai) {
    const fallbacks = [
      `@${artistName || 'UndergroundProducer'}: Studio session going hard tonight 🔥 Working on something special for the ${genre || 'underground'} scene.`,
      `Just discovered this absolute gem of a ${genre || 'techno'} track. The bass sound is insane! @${artistName || 'Producer'} know what's good.`,
      `@${artistName || 'RaveCrew'}: Tomorrow's warehouse party is going to be legendary. Sound system test confirmed 💪`,
      `The ${genre || 'techno'} revival is REAL. Finally proper kick drums are back in style.`,
      `Mixing tip of the day: Always check your mix on multiple sound systems before finalizing. Studio monitors lie!`
    ];
    return res.json({
      posts: fallbacks,
      isFallback: true
    });
  }

  try {
    const prompt = `Generate 5 authentic social media posts/reactions about underground electronic music.
      
      Context:
      - Artist/Producer: ${artistName || 'Unknown Producer'}
      - Genre: ${genre || 'techno'}
      - Mood: ${mood || 'excited'}
      - Recent activity: ${recentActivity || 'new studio session'}
      
      Return as JSON array of strings:
      ["post 1", "post 2", "post 3", "post 4", "post 5"]
      
      Mix of:
      - Excited fan reactions
      - Producer updates
      - Scene observations
      - Technical tips
      - Hype/energy posts
      
      Keep them short (under 100 chars each), use hashtags, emojis, lowercase, raver slang. Output raw JSON array only.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.9,
        systemInstruction: "You write authentic, engaging social media posts for underground electronic music culture."
      }
    });

    const posts = JSON.parse(response.text?.trim() || "[]");
    res.json({ posts, isFallback: false });
  } catch (err) {
    console.error("Gemini social feed error:", err);
    res.json({
      posts: [
        `@UndergroundBeat: Studio sessions are fire today 🔥`,
        `That bass sound on the new release is absolutely crushing it!`,
        `Underground scene going crazy right now`,
        `Mix tip: reference on multiple systems before mixing down`,
        `The ${genre} scene is absolutely heating up`
      ],
      isFallback: true
    });
  }
});

// 12. API: Dynamic Artist Bio Generator
app.post("/api/generate-ai-artist-bio", async (req, res) => {
  const { artistName, genre, fame, style, personality } = req.body;
  
  if (!ai) {
    const bios = [
      `${artistName || 'Unknown Artist'} is a ${genre || 'techno'} producer known for their distinctive approach to ${style || 'dark, driving rhythms'}. Building a reputation in the underground scene with releases that push sonic boundaries.`,
      `Born from the underground, ${artistName || 'Unknown Artist'} crafts ${genre || 'electronic'} music that blurs the line between nostalgia and future sounds. Their work reflects a deep understanding of ${style || 'club culture'}.`,
      `${artistName || 'Unknown Artist'} represents the new wave of ${genre || 'electronic'} artists who blend traditional hardware with modern production techniques. Their sets are known for ${style || 'energy and technical precision'}.`
    ];
    return res.json({
      bio: bios[Math.floor(Math.random() * bios.length)],
      isFallback: true
    });
  }

  try {
    const prompt = `Write a compelling, authentic artist bio for an underground electronic music producer.
      
      Artist details:
      - Name: ${artistName || 'Unknown Artist'}
      - Primary genre: ${genre || 'techno'}
      - Fame level: ${fame || 30}/100
      - Production style: ${style || 'dark, hypnotic, warehouse-ready'}
      - Personality: ${personality || 'dedicated, slightly mysterious'}
      
      Return as JSON:
      {
        "bio": "2-3 paragraph artist biography that sounds authentic and engaging"
      }
      
      Use underground music terminology. Mention influences, sound characteristics, scene involvement. Keep it realistic - not overly promotional. Output raw JSON only.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.85,
        systemInstruction: "You write authentic, compelling underground electronic music artist biographies."
      }
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json({ 
      bio: data.bio || `${artistName} is a rising talent in the underground electronic music scene.`,
      isFallback: false
    });
  } catch (err) {
    console.error("Gemini artist bio error:", err);
    res.json({
      bio: `${artistName || 'Unknown Artist'} continues to make waves in the underground ${genre || 'electronic'} music scene.`,
      isFallback: true
    });
  }
});

// 13. API: Premium NPC Dialogue with personality, mood & memory context
app.post("/api/npc/dialogue", async (req, res) => {
  const { npc, mood, personality, relationship, playerName, playerPrestige, trigger, memorySummaries } = req.body;

  if (!npc || !playerName) {
    return res.status(400).json({ error: "Missing required NPC dialogue parameters" });
  }

  if (!ai) {
    return res.json({ message: null, isFallback: true });
  }

  try {
    const moodDesc = mood?.currentEmotion || "neutral";
    const energyDesc = mood?.energy ? `Energy level: ${mood.energy}/100` : "";
    const burnoutDesc = mood?.burnout ? `Burnout level: ${mood.burnout}/100` : "";
    const relDesc = relationship ? `Affinity: ${relationship.affinity}/100, Trust: ${relationship.trust}/100` : "No prior relationship";
    const memoryContext = memorySummaries?.length > 0 
      ? `\nMemories of this person: ${memorySummaries.slice(0, 3).map((s: any) => s.summary).join("; ")}`
      : "";

    const prompt = `You are ${npc.name}, an electronic music ${npc.role || "producer"} in the underground scene.

Your personality:
- Openness to collaboration: ${personality?.openness || 50}/100
- Ego: ${personality?.ego || 50}/100
- Creativity: ${personality?.creativity || 50}/100
- Commercial tendency: ${personality?.commercialism || 50}/100
- Emotional intensity: ${personality?.emotionality || 50}/100
- Sociability: ${personality?.sociability || 50}/100

Your current state:
- Mood: ${moodDesc}
- ${energyDesc}
- ${burnoutDesc}

Your relationship with ${playerName} (prestige: ${playerPrestige}/100):
${relDesc}${memoryContext}

The conversation trigger is: "${trigger}"

Write a single paragraph reply from ${npc.name} to ${playerName} that:
- Reflects your personality (high ego = dismissive/pretentious, open = warm, etc.)
- Reflects your current mood (burnt out = tired, inspired = excited)
- Matches the relationship (positive affinity = friendly, negative = cold/hostile)
- Feels authentic to underground electronic music culture
- References the trigger context naturally
- Is 1-3 sentences, max 60 words
- No quotation marks around the text
- No sign-off with your name`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.85,
        systemInstruction: "You are an NPC in an electronic music simulation. Speak in first person, in character. Be concise and authentic.",
      },
    });

    res.json({ message: response.text?.trim() || null, isFallback: false });
  } catch (err: any) {
    console.error("Gemini NPC dialogue error:", err);
    res.json({ message: null, isFallback: true });
  }
});

// 14. API: Premium AI Event Generation
app.post("/api/npc/premium-event", async (req, res) => {
  const { eventType, playerName, npcs, hotGenre, weekDisplay } = req.body;

  if (!eventType || !playerName) {
    return res.status(400).json({ error: "Missing required event parameters" });
  }

  if (!ai) {
    return res.json({ title: null, description: null, isFallback: true });
  }

  try {
    const npcContext = npcs?.slice(0, 5).map((n: any) => 
      `${n.name} (${n.role || "producer"}, ego: ${n.personality?.ego || 50}/100)`
    ).join(", ") || "Various scene figures";

    const prompt = `You are generating a premium event for an underground electronic music simulation game.

Event type: ${eventType}
Player: ${playerName} (prestige ${req.body.playerPrestige || 50}/100)
Current hot genre: ${hotGenre || "techno"}
Active NPCs: ${npcContext}
Week: ${weekDisplay || "current"}

Generate a compelling, authentic scene event. Return ONLY valid JSON:
{
  "title": "Short punchy event title (max 8 words)",
  "description": "2-3 sentence event description with scene-specific detail"
}

If eventType is "interview", describe a music media interview ${playerName} is giving.
If eventType is "viral", describe a track or moment going viral in underground circles.
If eventType is "controversy", describe a scene controversy involving ${playerName} and other artists.
If eventType is "festival_report", describe a major festival's electronic music lineup announcement.
If eventType is "review", describe a major publication reviewing ${playerName}'s latest work.

Make it feel authentic to underground electronic music culture. Use specific details.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.9,
        systemInstruction: "You write immersive, authentic underground electronic music journalism.",
      },
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    res.json({
      title: data.title || null,
      description: data.description || null,
      isFallback: false
    });
  } catch (err: any) {
    console.error("Gemini premium event error:", err);
    res.json({ title: null, description: null, isFallback: true });
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
