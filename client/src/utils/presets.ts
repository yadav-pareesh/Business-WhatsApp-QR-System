export interface BusinessPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  orderFields: {
    customerName: { required: boolean; label: string };
    phone: { required: boolean; label: string };
    tableNumber?: { required: boolean; label: string };
    address?: { required: boolean; label: string };
    notes?: { required: boolean; label: string };
    appointmentTime?: { required: boolean; label: string };
    device?: { required: boolean; label: string };
  };
  sampleCategories: {
    name: string;
    description: string;
    products: {
      name: string;
      description: string;
      price: number;
    }[];
  }[];
}

export const BUSINESS_PRESETS: Record<string, BusinessPreset> = {
  Restaurant: {
    id: 'Restaurant',
    name: 'Restaurant / Dine-in',
    icon: 'UtensilsCrossed',
    description: 'Perfect for table ordering, room service, or self-pickup.',
    orderFields: {
      customerName: { required: true, label: 'Your Name' },
      phone: { required: true, label: 'WhatsApp / Mobile Number' },
      tableNumber: { required: false, label: 'Table / Seat / Room Number' },
      notes: { required: false, label: 'Cooking Instructions (e.g. less spicy)' },
    },
    sampleCategories: [
      {
        name: 'Starters & Quick Bites',
        description: 'Crispy appetizers and finger food',
        products: [
          { name: 'Crispy Corn Salt & Pepper', description: 'Fried sweet corn tossed in spices', price: 180 },
          { name: 'Paneer Tikka (6 Pcs)', description: 'Tandoori spiced grilled paneer cubes', price: 240 },
        ],
      },
      {
        name: 'Main Course',
        description: 'Freshly prepared mains with fragrant basmati rice & breads',
        products: [
          { name: 'Paneer Butter Masala', description: 'Rich tomato cashew gravy with cottage cheese', price: 290 },
          { name: 'Dal Makhani', description: 'Slow cooked black lentils simmered with butter and cream', price: 220 },
        ],
      },
      {
        name: 'Beverages & Desserts',
        description: 'Chilled drinks and traditional sweet treats',
        products: [
          { name: 'Fresh Mint Lime Soda', description: 'Sparkling sweet & salty lime refresher', price: 80 },
          { name: 'Gulab Jamun (2 Pcs)', description: 'Warm milk dumplings in saffron syrup', price: 90 },
        ],
      },
    ],
  },

  Cafe: {
    id: 'Cafe',
    name: 'Cafe & Coffee Shop',
    icon: 'Coffee',
    description: 'Espresso beverages, artisanal sandwiches, pastries, and snacks.',
    orderFields: {
      customerName: { required: true, label: 'Customer Name' },
      phone: { required: true, label: 'Phone Number' },
      tableNumber: { required: false, label: 'Table or Counter Pickup' },
      notes: { required: false, label: 'Special Requests (e.g. oat milk, less ice)' },
    },
    sampleCategories: [
      {
        name: 'Hot & Iced Coffee',
        description: 'Freshly brewed single origin beans',
        products: [
          { name: 'Caramel Macchiato', description: 'Steamed milk with vanilla, espresso & caramel drizzle', price: 190 },
          { name: 'Iced Americano', description: 'Double shot espresso over cold filtered water & ice', price: 140 },
        ],
      },
      {
        name: 'Sandwiches & Wraps',
        description: 'Toasted gourmet bread with house spreads',
        products: [
          { name: 'Pesto Mozzarella Panini', description: 'Sundried tomatoes, fresh basil pesto, mozzarella', price: 220 },
        ],
      },
    ],
  },

  Salon: {
    id: 'Salon',
    name: 'Salon & Spa / Beauty Parlour',
    icon: 'Scissors',
    description: 'Haircuts, styling, spa sessions, manicures, and grooming packages.',
    orderFields: {
      customerName: { required: true, label: 'Client Name' },
      phone: { required: true, label: 'WhatsApp Number' },
      appointmentTime: { required: true, label: 'Preferred Appointment Date & Time' },
      notes: { required: false, label: 'Preferred Stylist / Specific Requests' },
    },
    sampleCategories: [
      {
        name: 'Hair Styling & Cuts',
        description: 'Professional wash, cut and blowdry',
        products: [
          { name: 'Signature Haircut & Styling', description: 'Consultation, hair wash, precision cut & blowdry', price: 499 },
          { name: 'Deep Conditioning Hair Spa', description: 'Moisturizing hair mask with scalp massage and steam', price: 999 },
        ],
      },
      {
        name: 'Facials & Skin Care',
        description: 'Rejuvenating glow treatments',
        products: [
          { name: 'Hydra Glow Express Facial', description: 'Instant hydration and deep pore cleansing (45 mins)', price: 1299 },
        ],
      },
    ],
  },

  Grocery: {
    id: 'Grocery',
    name: 'Grocery / Kirana Store',
    icon: 'ShoppingBag',
    description: 'Fresh daily essentials, packaged goods, staples, and fruits & vegetables.',
    orderFields: {
      customerName: { required: true, label: 'Customer Name' },
      phone: { required: true, label: 'WhatsApp Phone Number' },
      address: { required: true, label: 'Home Delivery Address' },
      notes: { required: false, label: 'Delivery Time Slot / Notes' },
    },
    sampleCategories: [
      {
        name: 'Daily Staples',
        description: 'Rice, wheat, pulses, and cooking oils',
        products: [
          { name: 'Premium Basmati Rice (5 Kg)', description: 'Long grain aged fragrant rice', price: 450 },
          { name: 'Cold Pressed Groundnut Oil (1L)', description: 'Pure unrefined edible oil', price: 210 },
        ],
      },
      {
        name: 'Dairy & Breakfast',
        description: 'Milk, bread, butter, eggs',
        products: [
          { name: 'Farm Fresh Brown Eggs (Pack of 6)', description: 'Nutritious organic cage-free eggs', price: 65 },
          { name: 'Whole Wheat Multigrain Bread', description: 'Zero maida artisan sliced loaf', price: 55 },
        ],
      },
    ],
  },

  SweetShop: {
    id: 'SweetShop',
    name: 'Sweet Shop & Bakery',
    icon: 'Cake',
    description: 'Mithai boxes, gift hampers, fresh cakes, pastries, and snacks.',
    orderFields: {
      customerName: { required: true, label: 'Customer Name' },
      phone: { required: true, label: 'WhatsApp Contact' },
      address: { required: false, label: 'Delivery Address or Store Pickup' },
      notes: { required: false, label: 'Message on Cake / Gift Card Note' },
    },
    sampleCategories: [
      {
        name: 'Fresh Traditional Mithai',
        description: 'Pure desi ghee sweets made daily',
        products: [
          { name: 'Kaju Katli (500g Box)', description: 'Thin diamond slices of premium cashew paste', price: 480 },
          { name: 'Motichoor Ladoo (500g Box)', description: 'Melt-in-mouth tiny gram flour balls in desi ghee', price: 320 },
        ],
      },
      {
        name: 'Artisan Cakes',
        description: '100% eggless handcrafted party cakes',
        products: [
          { name: 'Belgian Chocolate Truffle (500g)', description: 'Rich dark chocolate sponge with ganache', price: 550 },
        ],
      },
    ],
  },

  RepairShop: {
    id: 'RepairShop',
    name: 'Electronics / Repair Shop',
    icon: 'Wrench',
    description: 'Mobile phone repairs, laptop services, accessories, and spare parts.',
    orderFields: {
      customerName: { required: true, label: 'Customer Name' },
      phone: { required: true, label: 'Contact Number' },
      device: { required: true, label: 'Device Model (e.g. iPhone 13, Dell Inspiron)' },
      notes: { required: true, label: 'Problem Description / Symptoms' },
    },
    sampleCategories: [
      {
        name: 'Screen & Battery Services',
        description: 'Original quality replacement parts with 3-month warranty',
        products: [
          { name: 'Original Screen Replacement Inspection', description: 'Diagnostic inspection and quote confirmation', price: 299 },
          { name: 'High-Capacity Battery Replacement', description: 'Certified battery installation with health check', price: 1199 },
        ],
      },
    ],
  },
};
