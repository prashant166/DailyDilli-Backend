"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const places = [
      {
        name: "Aravalli Biodiversity Park",
        category_id: 3, // Adventure
        description: "I explored this vast green space near Vasant Kunj and instantly fell in love with the raw trails, chirping birds, and peaceful silence. It felt like escaping Delhi without ever leaving it.",
        location: "Vasant Vihar, Delhi",
        tags: Sequelize.literal("ARRAY['Nature', 'Peaceful', 'Hidden Gems', 'Adventure', 'Morning Walk']::TEXT[]"),
        budget_per_head: "Low",
        entry_fee: 0,
        best_time_to_visit: "Morning",
        parking_available: true,
        latitude: 28.540305,
        longitude: 77.158163,
        status: "approved",
      },
      {
        name: "Jahapanah City Forest",
        category_id: 3, // Adventure
        description: "Wandering through Jahapanah felt like time slowed down. It’s lush, less crowded, and filled with forest sounds. Great for joggers, thinkers, or anyone needing a digital detox.",
        location: "Kalkaji, South Delhi",
        tags: Sequelize.literal("ARRAY['Adventure', 'Nature', 'Budget-Friendly', 'Peaceful', 'Hidden Gems']::TEXT[]"),
        budget_per_head: "Low",
        entry_fee: 0,
        best_time_to_visit: "Morning",
        parking_available: true,
        latitude: 28.540824,
        longitude: 77.245164,
        status: "approved",
      },
      {
        name: "Malcha Mahal",
        category_id: 12, // Hidden Gems
        description: "Visiting Malcha Mahal was surreal. Tucked inside a dense forest near Chanakyapuri, the abandoned palace has an eerie charm that feels straight out of a mystery novel. Definitely not for the faint-hearted, but unforgettable.",
        location: "Chanakyapuri, New Delhi",
        tags: Sequelize.literal("ARRAY['Hidden Gems', 'Historical', 'Forest Vibes', 'Eerie', 'Peaceful']::TEXT[]"),
        budget_per_head: "Low",
        entry_fee: 0,
        best_time_to_visit: "Evening",
        parking_available: false,
        latitude: 28.601222,
        longitude: 77.180650,
        status: "approved",
      },
      {
        name: "Begumpur Masjid",
        category_id: 1, // Historical
        description: "Tucked inside a residential pocket near Hauz Khas, Begumpur Masjid blew me away. Its towering walls, abandoned arches, and hauntingly quiet courtyards make you feel like you're in a forgotten city.",
        location: "Begumpur, Malviya Nagar, Delhi",
        tags: Sequelize.literal("ARRAY['Historical', 'Peaceful', 'Hidden Gems', 'Architecture']::TEXT[]"),
        budget_per_head: "Low",
        entry_fee: 0,
        best_time_to_visit: "Afternoon",
        parking_available: false,
        latitude: 28.541722,
        longitude: 77.215847,
        status: "approved",
      },
      {
        name: "Zafar Mahal",
        category_id: 1, // Historical
        description: "As I wandered into Zafar Mahal in Mehrauli, I was struck by the quiet sadness of a fading empire. It’s poetic, untouched, and filled with stories — especially during golden hour.",
        location: "Mehrauli, Delhi",
        tags: Sequelize.literal("ARRAY['Historical', 'Heritage', 'Architecture', 'Peaceful']::TEXT[]"),
        budget_per_head: "Low",
        entry_fee: 0,
        best_time_to_visit: "Evening",
        parking_available: false,
        latitude: 28.516134,
        longitude: 77.185771,
        status: "approved",
      },
      {
  name: "Food Bus of India",
  category_id: 12, // Hidden Gems
  description: "I stumbled upon this vibrant red double-decker food bus near Rajendra Place Metro and it instantly became a favorite. It's quirky, cozy, and serves delicious street-style meals — perfect for late-night hunger or a fun outing with friends.",
  location: "Rajendra Place, Delhi",
  tags: Sequelize.literal("ARRAY['Food Truck', 'Late Night', 'Hidden Gems', 'Budget-Friendly', 'Near Metro']::TEXT[]"),
  budget_per_head: "Medium",
  entry_fee: 0,
  best_time_to_visit: "Evening",
  parking_available: true,
  latitude: 28.6413,
  longitude: 77.1804,
  status: "approved",
}

    ];

    return queryInterface.bulkInsert("Place", places, {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Place", null, {});
  },
};
