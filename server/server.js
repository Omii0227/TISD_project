const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory storage for chats
const chats = new Map();

// Urban Farming Knowledge Base with improved responses
const urbanFarmingResponses = [
  {
    keywords: ['start', 'begin', 'how to', 'first step'],
    response: "To start urban farming, I'll need to know a few things about your space. What type of area do you have available? (balcony, rooftop, backyard, windowsill, indoor space)",
    followUp: "space",
    stage: "space_assessment"
  },
  {
    keywords: ['vertical', 'wall'],
    response: "Vertical farming is perfect for urban spaces! It involves growing plants in stacked layers or vertically inclined surfaces.\n\nKey benefits:\n- Uses up to 95% less water than traditional farming\n- Maximizes limited space in urban environments\n- Can be implemented using recycled materials\n\nDo you have a specific space in mind for your vertical garden? Or would you like to know which crops work best for vertical farming?",
    followUp: "vertical_specifics"
  },
  {
    keywords: ['rooftop', 'terrace', 'roof'],
    response: "Rooftop farming is widely practiced in India, especially in Kerala where over 20,000 rooftop farmers contribute to food security!\n\nBefore we proceed with rooftop farming, I should ask - have you checked if your roof can support the weight of containers and soil?",
    followUp: "roof_assessment",
    stage: "structural_check"
  },
  {
    keywords: ['hydroponic', 'hydroponics', 'water'],
    response: "Hydroponics is soil-less farming using nutrient-rich water. It's ideal for urban settings!\n\nBenefits in Indian context:\n- Saves 70-90% water compared to traditional farming\n- Can be set up in limited spaces\n- Higher yield and faster growth\n\nAre you interested in setting up a hydroponic system? I can guide you through DIY options or commercial kits.",
    followUp: "hydroponics_interest"
  },
  {
    keywords: ['hydrogel', 'water retention', 'drought'],
    response: "Hydrogel technology can dramatically improve water retention in urban farms, especially valuable in India's seasonal water scarcity.\n\nKey facts:\n- Hydrogels can absorb up to 400 times their weight in water\n- They release water gradually to plant roots\n- Can reduce irrigation needs by 50-70%\n\nWhat type of growing system are you using where you'd like to incorporate hydrogels?",
    followUp: "growing_system"
  },
  {
    keywords: ['agritecture', 'architecture'],
    response: "Agritecture (agriculture + architecture) integrates farming into urban structures using facades, balconies, lobbies, and rooftops.\n\nExamples in India:\n- Vertical gardens on commercial buildings in Bangalore and Mumbai\n- Terrace farming initiatives in Hyderabad\n- Living walls in Delhi NCR office complexes\n\nWhat type of building structure are you looking to incorporate farming into?",
    followUp: "building_type"
  },
  {
    keywords: ['aeroponic', 'aeroponics', 'mist'],
    response: "Aeroponics uses nutrient mist instead of water or soil and consumes 90% less water than hydroponics while increasing crop yield by up to 75%!\n\nFor Indian settings:\n1. It's excellent for heat-sensitive crops during summer\n2. Requires reliable electricity for misting systems\n3. Provides excellent yield for herbs and leafy greens\n\nDo you have a specific space in mind for an aeroponic system? It can be as small as a cupboard or as large as a dedicated room.",
    followUp: "aeroponics_space"
  },
  {
    keywords: ['aquaponic', 'aquaponics', 'fish'],
    response: "Aquaponics combines hydroponics with fish farming in a closed-loop system. Fish waste fertilizes plants, and plants clean water for fish.\n\nIn the Indian context:\n- Works well with native fish like rohu, catla, and tilapia\n- Suitable crops include coriander, mint, spinach, and various leafy greens\n- Requires 90% less water than conventional farming\n\nWhat size system are you considering - small (home), medium (community), or large (commercial)?",
    followUp: "aquaponics_size"
  },
  {
    keywords: ['small space', 'limited', 'balcony', 'apartment'],
    response: "Small spaces can be surprisingly productive! Let me help you maximize your urban farming potential. What's the approximate size of your space (in square feet or meters)?",
    followUp: "space_size",
    stage: "space_measurement"
  },
  {
    keywords: ['organic', 'natural', 'chemical-free'],
    response: "Organic urban farming in India uses traditional methods like neem-based pest control, kitchen waste compost, and companion planting. What specific aspect of organic farming are you most interested in - pest management, soil fertility, or seed selection?",
    followUp: "organic_aspect"
  },
  {
    keywords: ['climate', 'weather', 'season', 'temperature'],
    response: "Climate greatly affects urban farming success. Which city or region in India are you farming in? This will help me provide region-specific climate recommendations.",
    followUp: "location",
    stage: "location_assessment"
  },
  {
    keywords: ['soil', 'potting mix', 'medium', 'dirt'],
    response: "Good soil is essential for urban farming success! For container gardens, a mix of garden soil, compost, and coco peat in equal parts works well in most Indian cities. Do you want to make your own soil mix or buy a premixed potting soil?",
    followUp: "soil_preference",
    stage: "soil_selection"
  },
  {
    keywords: ['water', 'irrigation', 'watering'],
    response: "Water management is crucial in urban farming. Most container plants need consistent moisture. In hot Indian summers, you might need to water daily. Have you considered any water conservation methods like drip irrigation or self-watering containers?",
    followUp: "water_conservation"
  },
  {
    keywords: ['pest', 'insect', 'disease', 'bug'],
    response: "Pest management in urban farms can be done naturally. Neem oil spray works for most common pests. Marigolds repel many insects when planted alongside vegetables. What specific pest problems are you experiencing or concerned about?",
    followUp: "pest_specifics"
  },
  {
    keywords: ['vegetable', 'fruit', 'herb', 'crop', 'plant', 'grow'],
    response: "For urban farming in India, some excellent crops include tomatoes, chilies, okra, methi (fenugreek), spinach, and various herbs. What specific vegetables or herbs are you interested in growing?",
    followUp: "crop_selection",
    stage: "crop_selection"
  },
  {
    keywords: ['container', 'pot', 'planter'],
    response: "Container gardening is perfect for urban settings! You can use regular pots, grow bags, or even repurpose items like buckets or old kitchen containers. What type of containers do you have available or are planning to use?",
    followUp: "container_type"
  },
  {
    keywords: ['sunlight', 'sun', 'shade', 'light'],
    response: "Sunlight is crucial for most edible plants. How many hours of direct sunlight does your space receive daily? This will help determine which crops will thrive in your conditions.",
    followUp: "sunlight_hours",
    stage: "sunlight_assessment"
  },
  {
    keywords: ['fertilizer', 'feed', 'nutrient', 'compost'],
    response: "For organic fertilization in urban farms, kitchen waste compost, vermicompost, and liquid fertilizers from banana peels or tea leaves work well. Are you interested in making your own organic fertilizers or purchasing ready-made options?",
    followUp: "fertilizer_preference"
  },
  {
    keywords: ['cost', 'budget', 'money', 'investment', 'expensive'],
    response: "Urban farming startup costs vary widely. A basic balcony setup with 5-10 containers can start at ₹1,000-3,000. Hydroponics systems typically cost ₹5,000-15,000. What's your approximate budget for starting your urban farm?",
    followUp: "budget_range"
  },
  {
    keywords: ['seed', 'seedling', 'sapling', 'plant'],
    response: "You can start your urban farm from seeds or seedlings. Seeds are more economical but take longer, while seedlings give quicker results. Local nurseries often have region-appropriate varieties. Would you prefer to start from seeds or seedlings?",
    followUp: "propagation_preference"
  }
];

// Conversation flow responses based on context
const conversationFlows = {
  space_assessment: {
    response: (context) => {
      if (!context.space) return "What type of space do you have available for urban farming? (balcony, rooftop, backyard, windowsill, indoor)";
      
      if (context.space.includes("balcony")) {
        return "Balconies are great for container gardening! How large is your balcony (approximate square feet), and does it get direct sunlight?";
      } else if (context.space.includes("rooftop")) {
        return "Rooftop gardens have amazing potential! Before we proceed, have you checked if your roof can support the weight of containers and soil?";
      } else if (context.space.includes("window")) {
        return "Window farming is perfect for herbs and small greens. Does your window get at least 4-6 hours of sunlight?";
      } else if (context.space.includes("indoor")) {
        return "Indoor farming typically requires supplemental lighting. Are you interested in growing microgreens, herbs, or setting up a hydroponic system?";
      } else {
        return "How much area (in square feet or meters) do you have available for farming?";
      }
    },
    next_stage: "sunlight_assessment"
  },
  
  sunlight_assessment: {
    response: (context) => {
      return "How many hours of direct sunlight does your space receive daily? This will help determine which crops will thrive in your conditions.";
    },
    next_stage: "crop_selection"
  },
  
  crop_selection: {
    response: (context) => {
      if (!context.space) {
        return "What vegetables, herbs or fruits would you like to grow in your urban farm?";
      }
      
      if (context.space.includes("balcony") || context.space.includes("container")) {
        return "For balcony container gardens, herbs (mint, coriander, basil), greens (spinach, fenugreek), tomatoes, chilies, and dwarf varieties of vegetables work well. What would you like to grow?";
      } else if (context.space.includes("rooftop")) {
        return "Rooftop gardens are versatile enough to grow most vegetables including tomatoes, chilies, okra, brinjal, beans, and various greens. What crops are you interested in?";
      } else if (context.space.includes("window")) {
        return "Window sills are perfect for herbs like mint, basil, coriander, and small greens like microgreens or lettuce. Which of these interest you?";
      } else if (context.space.includes("indoor")) {
        return "For indoor growing without special lighting, herbs and microgreens work best. With grow lights, you can cultivate lettuce, spinach, and many herbs. What would you like to grow?";
      } else {
        return "What vegetables, herbs or fruits would you like to grow in your urban farm?";
      }
    },
    next_stage: "soil_selection"
  },
  
  soil_selection: {
    response: (context) => {
      return "For container urban farming, soil quality is crucial. A good mix contains garden soil, compost, and coco peat in equal parts. Do you plan to make your own soil mix or buy pre-mixed potting soil?";
    },
    next_stage: "watering_plan"
  },
  
  watering_plan: {
    response: (context) => {
      return "Let's talk about watering. Most container plants need regular watering, especially during summer. Have you considered any water conservation methods like drip irrigation or self-watering containers?";
    },
    next_stage: "next_steps"
  },
  
  next_steps: {
    response: (context) => {
      let cropList = context.crops ? context.crops.join(", ") : "your chosen crops";
      
      return `Great! You're now ready to start urban farming with ${cropList} in your ${context.space || "space"}. Would you like specific information about starting seeds, transplanting seedlings, or ongoing maintenance?`;
    },
    next_stage: "maintenance"
  }
};

// Function to extract meaning from user input
function analyzeUserInput(userMessage, currentContext = {}) {
  const userInput = userMessage.toLowerCase();
  let newContext = {...currentContext};
  
  // Check for space types
  if (userInput.includes("balcony") || userInput.includes("terrace")) {
    newContext.space = "balcony";
  } else if (userInput.includes("rooftop") || userInput.includes("roof")) {
    newContext.space = "rooftop";
  } else if (userInput.includes("window") || userInput.includes("sill")) {
    newContext.space = "window";
  } else if (userInput.includes("indoor") || userInput.includes("inside")) {
    newContext.space = "indoor";
  } else if (userInput.includes("yard") || userInput.includes("garden") || userInput.includes("plot")) {
    newContext.space = "yard";
  }
  
  // Check for crops
  const commonCrops = [
    "tomato", "chili", "pepper", "okra", "brinjal", "eggplant", "beans", 
    "peas", "carrot", "radish", "spinach", "lettuce", "greens", "methi", 
    "fenugreek", "coriander", "mint", "basil", "tulsi", "cucumber", "gourd"
  ];
  
  const foundCrops = commonCrops.filter(crop => userInput.includes(crop));
  if (foundCrops.length > 0) {
    newContext.crops = foundCrops;
  }
  
  // Check for locations
  const indianCities = [
    "delhi", "mumbai", "bangalore", "chennai", "kolkata", "hyderabad", 
    "pune", "jaipur", "lucknow", "ahmedabad", "surat", "kochi", "bhopal"
  ];
  
  const foundCity = indianCities.find(city => userInput.includes(city));
  if (foundCity) {
    newContext.location = foundCity;
  }
  
  return newContext;
}

// Enhanced function to generate context-aware responses
function generateUrbanFarmingResponse(userMessage, userId, existingContext = {}) {
  const userInput = userMessage.toLowerCase();
  let context = {...existingContext};
  
  // Update context based on user input
  const newContextInfo = analyzeUserInput(userMessage, context);
  context = {...context, ...newContextInfo};
  
  // Check if we're in a specific conversation flow stage
  if (context.stage && conversationFlows[context.stage]) {
    const flow = conversationFlows[context.stage];
    const response = flow.response(context);
    context.stage = flow.next_stage;
    return { response, context };
  }
  
  // Check for keywords from our knowledge base
  for (const item of urbanFarmingResponses) {
    if (item.keywords.some(keyword => userInput.includes(keyword))) {
      if (item.stage) {
        context.stage = item.stage;
      }
      if (item.followUp) {
        context.lastQuestion = item.followUp;
      }
      return { response: item.response, context };
    }
  }
  
  // If we get here, no specific matches were found
  // Give a more intelligent default response based on conversation history
  
  // If we have some context, use it to guide the response
  if (context.space) {
    return {
      response: `I see you're interested in urban farming in your ${context.space}. Would you like to know about suitable crops, container options, or growing techniques specifically for this space?`,
      context
    };
  }
  
  if (context.crops && context.crops.length > 0) {
    return {
      response: `Growing ${context.crops.join(", ")} in an urban setting is a great choice! Would you like specific information about growing conditions, containers, or care instructions for these plants?`,
      context: {...context, stage: "crop_care"}
    };
  }
  
  // Default intelligent response with conversation starters
  return {
    response: "I'd be happy to help with your urban farming questions! To provide the most relevant information, could you tell me:\n\n1. What type of space you have available (balcony, rooftop, windowsill, etc.)?\n2. What you're interested in growing?\n3. Whether you have any specific challenges (limited sunlight, water restrictions, etc.)?",
    context: {...context, stage: "space_assessment"}
  };
}

// OpenFarm API Route
app.get('/api/plants/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const response = await axios.get(`https://openfarm.cc/api/v1/crops/?filter=${name}`);
    res.json(response.data);
  } catch (error) {
    console.error('OpenFarm API Error:', error);
    res.status(500).json({ error: 'Failed to fetch plant data', details: error.message });
  }
});

// Open-Meteo API Route
app.get('/api/weather', async (req, res) => {
  const { lat = '28.6139', lon = '77.2090' } = req.query; // Default to Delhi coordinates
  try {
    const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
    res.json(response.data);
  } catch (error) {
    console.error('Open-Meteo API Error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data', details: error.message });
  }
});

// Trefle API Route
app.get('/api/trefle/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const response = await axios.get(`https://trefle.io/api/v1/plants/search?token=${process.env.TREFLE_API_TOKEN}&q=${query}`);
    res.json(response.data);
  } catch (error) {
    console.error('Trefle API Error:', error);
    res.status(500).json({ error: 'Failed to fetch plant info from Trefle', details: error.message });
  }
});

// Enhanced Chat Route with context awareness
app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId = 'anonymous' } = req.body;
    
    // Log the incoming message for debugging
    console.log(`Received message from ${userId}: ${message}`);
    
    // Get existing chat and context if available
    let context = {};
    if (chats.has(userId)) {
      context = chats.get(userId).context;
    }
    
    // Generate a response based on the message and existing context
    const result = generateUrbanFarmingResponse(message, userId, context);
    const aiResponse = result.response;
    const updatedContext = result.context;
    
    // Store in memory
    if (chats.has(userId)) {
      const chat = chats.get(userId);
      chat.messages.push(
        { role: 'user', content: message },
        { role: 'assistant', content: aiResponse }
      );
      chat.context = updatedContext;
    } else {
      chats.set(userId, {
        messages: [
          { role: 'system', content: 'Urban Farming Assistant' },
          { role: 'user', content: message },
          { role: 'assistant', content: aiResponse }
        ],
        context: updatedContext
      });
    }

    // Send response to client
    res.json({ message: aiResponse });
      
  } catch (error) {
    console.error('General error processing chat:', error);
    res.status(500).json({ 
      error: 'Failed to process request', 
      details: error.message || 'Unknown error'
    });
  }
});

// Simple test route to verify server is working
app.get('/api/test', (req, res) => {
  res.json({ status: 'Urban Farming API is operational' });
});

// Static assets (for production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🌱 Urban Farming Server running on http://localhost:${PORT}`);
  console.log(`Trefle API Token configured: ${process.env.TREFLE_API_TOKEN ? 'Yes' : 'No'}`);
});