// Comprehensive Merchant Category Code (MCC) Database
// Based on ISO 18245 standard with CardWise category mapping

export interface MCCMapping {
  code: string;
  description: string;
  category: string;
  subcategory?: string;
}

export const MCC_DATABASE: Record<string, MCCMapping> = {
  // GROCERIES & FOOD STORES
  '5411': { code: '5411', description: 'Grocery Stores, Supermarkets', category: 'Groceries' },
  '5412': { code: '5412', description: 'Grocery Stores (Non-Supermarket)', category: 'Groceries' },
  '5422': { code: '5422', description: 'Freezer and Locker Meat Provisioners', category: 'Groceries' },
  '5441': { code: '5441', description: 'Candy, Nut, and Confectionery Stores', category: 'Groceries' },
  '5451': { code: '5451', description: 'Dairy Products Stores', category: 'Groceries' },
  '5462': { code: '5462', description: 'Bakeries', category: 'Groceries' },
  '5499': { code: '5499', description: 'Miscellaneous Food Stores', category: 'Groceries' },
  '5300': { code: '5300', description: 'Wholesale Clubs', category: 'Groceries' },

  // DINING & RESTAURANTS
  '5811': { code: '5811', description: 'Caterers', category: 'Dining' },
  '5812': { code: '5812', description: 'Eating Places, Restaurants', category: 'Dining' },
  '5813': { code: '5813', description: 'Drinking Places (Alcoholic Beverages)', category: 'Dining' },
  '5814': { code: '5814', description: 'Fast Food Restaurants', category: 'Dining' },

  // GAS STATIONS & AUTOMOTIVE
  '5541': { code: '5541', description: 'Service Stations (Gasoline)', category: 'Gas' },
  '5542': { code: '5542', description: 'Automated Fuel Dispensers', category: 'Gas' },
  '5531': { code: '5531', description: 'Auto and Home Supply Stores', category: 'Gas' },
  '5532': { code: '5532', description: 'Automotive Tire Stores', category: 'Gas' },
  '5533': { code: '5533', description: 'Automotive Parts and Accessories Stores', category: 'Gas' },
  '5571': { code: '5571', description: 'Motorcycle Shops and Dealers', category: 'Gas' },
  '7531': { code: '7531', description: 'Auto Body Repair Shops', category: 'Gas' },
  '7534': { code: '7534', description: 'Tire Retreading and Repair', category: 'Gas' },
  '7535': { code: '7535', description: 'Auto Paint Shops', category: 'Gas' },
  '7538': { code: '7538', description: 'Auto Service Shops', category: 'Gas' },
  '7549': { code: '7549', description: 'Towing Services', category: 'Gas' },

  // TRAVEL & TRANSPORTATION
  '4111': { code: '4111', description: 'Transportation - Suburban and Local Commuter', category: 'Transit' },
  '4112': { code: '4112', description: 'Passenger Railways', category: 'Transit' },
  '4119': { code: '4119', description: 'Ambulance Services', category: 'Transit' },
  '4121': { code: '4121', description: 'Taxicabs/Limousines', category: 'Transit' },
  '4131': { code: '4131', description: 'Bus Lines', category: 'Transit' },
  '4214': { code: '4214', description: 'Motor Freight Carriers and Trucking', category: 'Transit' },
  '4215': { code: '4215', description: 'Courier Services', category: 'Transit' },
  '4225': { code: '4225', description: 'Public Warehousing and Storage', category: 'Transit' },
  '4511': { code: '4511', description: 'Airlines, Air Carriers', category: 'Travel' },
  '4582': { code: '4582', description: 'Airports, Flying Fields', category: 'Travel' },
  '4722': { code: '4722', description: 'Travel Agencies, Tour Operators', category: 'Travel' },
  '7011': { code: '7011', description: 'Hotels, Motels, and Resorts', category: 'Travel' },
  '7012': { code: '7012', description: 'Timeshares', category: 'Travel' },
  '7033': { code: '7033', description: 'Trailer Parks, Campgrounds', category: 'Travel' },
  '7512': { code: '7512', description: 'Car Rental Agencies', category: 'Travel' },
  '7513': { code: '7513', description: 'Truck and Utility Trailer Rentals', category: 'Travel' },
  '7519': { code: '7519', description: 'Recreational Vehicle Rentals', category: 'Travel' },

  // DEPARTMENT STORES & RETAIL
  '5311': { code: '5311', description: 'Department Stores', category: 'Shopping' },
  '5331': { code: '5331', description: 'Variety Stores', category: 'Shopping' },
  '5399': { code: '5399', description: 'Miscellaneous General Merchandise', category: 'Shopping' },
  '5200': { code: '5200', description: 'Home Supply Warehouse Stores', category: 'Shopping' },
  '5211': { code: '5211', description: 'Lumber, Building Materials Stores', category: 'Shopping' },
  '5231': { code: '5231', description: 'Glass, Paint, and Wallpaper Stores', category: 'Shopping' },
  '5251': { code: '5251', description: 'Hardware Stores', category: 'Shopping' },
  '5261': { code: '5261', description: 'Nurseries, Lawn and Garden Supply Stores', category: 'Shopping' },

  // CLOTHING & ACCESSORIES
  '5611': { code: '5611', description: 'Men\'s and Boy\'s Clothing and Accessories', category: 'Shopping' },
  '5621': { code: '5621', description: 'Women\'s Ready-To-Wear Stores', category: 'Shopping' },
  '5631': { code: '5631', description: 'Women\'s Accessory and Specialty Shops', category: 'Shopping' },
  '5641': { code: '5641', description: 'Children\'s and Infant\'s Wear Stores', category: 'Shopping' },
  '5651': { code: '5651', description: 'Family Clothing Stores', category: 'Shopping' },
  '5661': { code: '5661', description: 'Shoe Stores', category: 'Shopping' },
  '5681': { code: '5681', description: 'Furriers and Fur Shops', category: 'Shopping' },
  '5691': { code: '5691', description: 'Men\'s, Women\'s Clothing Stores', category: 'Shopping' },
  '5697': { code: '5697', description: 'Tailors, Alterations', category: 'Shopping' },
  '5698': { code: '5698', description: 'Wig and Toupee Stores', category: 'Shopping' },
  '5699': { code: '5699', description: 'Miscellaneous Apparel and Accessory Shops', category: 'Shopping' },

  // ELECTRONICS & TECHNOLOGY
  '5732': { code: '5732', description: 'Electronics Stores', category: 'Shopping' },
  '5733': { code: '5733', description: 'Music Stores-Musical Instruments, Pianos', category: 'Shopping' },
  '5734': { code: '5734', description: 'Computer Software Stores', category: 'Shopping' },
  '5735': { code: '5735', description: 'Record Stores', category: 'Shopping' },
  '5816': { code: '5816', description: 'Digital Goods Media', category: 'Entertainment' },
  '5817': { code: '5817', description: 'Digital Goods Games', category: 'Entertainment' },
  '5818': { code: '5818', description: 'Digital Goods Applications', category: 'Entertainment' },

  // UTILITIES
  '4814': { code: '4814', description: 'Telecommunication Equipment and Telephone Sales', category: 'Utilities' },
  '4815': { code: '4815', description: 'Monthly Summary Telephone Charges', category: 'Utilities' },
  '4816': { code: '4816', description: 'Computer Network Services', category: 'Utilities' },
  '4821': { code: '4821', description: 'Telegraph Services', category: 'Utilities' },
  '4829': { code: '4829', description: 'Wires, Money Orders', category: 'Utilities' },
  '4899': { code: '4899', description: 'Cable, Satellite, and Other Pay Television and Radio', category: 'Utilities' },
  '4900': { code: '4900', description: 'Utilities', category: 'Utilities' },

  // HEALTHCARE
  '8011': { code: '8011', description: 'Doctors', category: 'Healthcare' },
  '8021': { code: '8021', description: 'Dentists, Orthodontists', category: 'Healthcare' },
  '8031': { code: '8031', description: 'Osteopaths', category: 'Healthcare' },
  '8041': { code: '8041', description: 'Chiropractors', category: 'Healthcare' },
  '8042': { code: '8042', description: 'Optometrists, Ophthalmologist', category: 'Healthcare' },
  '8043': { code: '8043', description: 'Opticians, Eyeglasses', category: 'Healthcare' },
  '8049': { code: '8049', description: 'Podiatrists, Chiropodists', category: 'Healthcare' },
  '8050': { code: '8050', description: 'Nursing/Personal Care', category: 'Healthcare' },
  '8062': { code: '8062', description: 'Hospitals', category: 'Healthcare' },
  '8071': { code: '8071', description: 'Medical and Dental Labs', category: 'Healthcare' },
  '8099': { code: '8099', description: 'Medical Services', category: 'Healthcare' },
  '5912': { code: '5912', description: 'Drug Stores and Pharmacies', category: 'Healthcare' },
  '5975': { code: '5975', description: 'Hearing Aids Sales and Supplies', category: 'Healthcare' },
  '5976': { code: '5976', description: 'Orthopedic Goods', category: 'Healthcare' },

  // ENTERTAINMENT & RECREATION
  '7832': { code: '7832', description: 'Motion Picture Theaters', category: 'Entertainment' },
  '7841': { code: '7841', description: 'Video Tape Rental Stores', category: 'Entertainment' },
  '7911': { code: '7911', description: 'Dance Halls, Studios, Schools', category: 'Entertainment' },
  '7922': { code: '7922', description: 'Theatrical Ticket Agencies', category: 'Entertainment' },
  '7929': { code: '7929', description: 'Bands, Orchestras', category: 'Entertainment' },
  '7932': { code: '7932', description: 'Pool and Billiard Halls', category: 'Entertainment' },
  '7933': { code: '7933', description: 'Bowling Alleys', category: 'Entertainment' },
  '7941': { code: '7941', description: 'Sports Clubs/Fields', category: 'Entertainment' },
  '7991': { code: '7991', description: 'Tourist Attractions and Exhibits', category: 'Entertainment' },
  '7992': { code: '7992', description: 'Golf Courses - Public', category: 'Entertainment' },
  '7993': { code: '7993', description: 'Video Amusement Game Supplies', category: 'Entertainment' },
  '7994': { code: '7994', description: 'Video Game Arcades', category: 'Entertainment' },
  '7995': { code: '7995', description: 'Betting/Casino Gambling', category: 'Entertainment' },
  '7996': { code: '7996', description: 'Amusement Parks/Carnivals', category: 'Entertainment' },
  '7997': { code: '7997', description: 'Country Clubs', category: 'Entertainment' },
  '7998': { code: '7998', description: 'Aquariums', category: 'Entertainment' },
  '7999': { code: '7999', description: 'Recreation Services', category: 'Entertainment' },

  // FINANCIAL SERVICES
  '6010': { code: '6010', description: 'Manual Cash Disburse', category: 'Financial Services' },
  '6011': { code: '6011', description: 'Automated Cash Disburse', category: 'Financial Services' },
  '6012': { code: '6012', description: 'Financial Institutions', category: 'Financial Services' },
  '6051': { code: '6051', description: 'Non-FI, Money Orders', category: 'Financial Services' },
  '6211': { code: '6211', description: 'Security Brokers/Dealers', category: 'Financial Services' },
  '6300': { code: '6300', description: 'Insurance Underwriting, Premiums', category: 'Financial Services' },
  '6513': { code: '6513', description: 'Real Estate Agents and Managers - Rentals', category: 'Financial Services' },

  // STREAMING & DIGITAL SERVICES
  '5815': { code: '5815', description: 'Digital Goods Media - Books, Movies, Music', category: 'Streaming' },
  '5967': { code: '5967', description: 'Direct Marketing - Inbound Telemarketing', category: 'Streaming' },
  '7273': { code: '7273', description: 'Dating/Escort Services', category: 'Entertainment' },
  '7399': { code: '7399', description: 'Business Services', category: 'Other' },

  // PROFESSIONAL SERVICES
  '7311': { code: '7311', description: 'Advertising Services', category: 'Other' },
  '7321': { code: '7321', description: 'Consumer Credit Reporting Agencies', category: 'Financial Services' },
  '7333': { code: '7333', description: 'Commercial Photography, Art and Graphics', category: 'Other' },
  '7338': { code: '7338', description: 'Quick Copy, Repro, and Blueprint', category: 'Other' },
  '7339': { code: '7339', description: 'Stenographic and Secretarial Support Services', category: 'Other' },
  '7342': { code: '7342', description: 'Exterminating Services', category: 'Other' },
  '7349': { code: '7349', description: 'Cleaning and Maintenance', category: 'Other' },
  '7361': { code: '7361', description: 'Employment/Temp Agencies', category: 'Other' },
  '7372': { code: '7372', description: 'Computer Programming', category: 'Other' },
  '7375': { code: '7375', description: 'Information Retrieval Services', category: 'Other' },
  '7379': { code: '7379', description: 'Computer Maintenance and Repair', category: 'Other' },
  '7392': { code: '7392', description: 'Consulting, Public Relations', category: 'Other' },
  '7393': { code: '7393', description: 'Detective Agencies', category: 'Other' },
  '7394': { code: '7394', description: 'Equipment Rental', category: 'Other' },
  '7395': { code: '7395', description: 'Photo Developing', category: 'Other' },

  // PERSONAL SERVICES
  '7210': { code: '7210', description: 'Laundry, Cleaning Services', category: 'Other' },
  '7211': { code: '7211', description: 'Laundries', category: 'Other' },
  '7216': { code: '7216', description: 'Dry Cleaners', category: 'Other' },
  '7217': { code: '7217', description: 'Carpet/Upholstery Cleaning', category: 'Other' },
  '7221': { code: '7221', description: 'Photographic Studios', category: 'Other' },
  '7230': { code: '7230', description: 'Barber and Beauty Shops', category: 'Other' },
  '7251': { code: '7251', description: 'Shoe Repair/Hat Cleaning', category: 'Other' },
  '7261': { code: '7261', description: 'Funeral Services', category: 'Other' },
  '7273': { code: '7273', description: 'Dating/Escort Services', category: 'Other' },
  '7276': { code: '7276', description: 'Tax Preparation Services', category: 'Other' },
  '7277': { code: '7277', description: 'Counseling Services', category: 'Healthcare' },
  '7278': { code: '7278', description: 'Buying/Shopping Services', category: 'Other' },
  '7296': { code: '7296', description: 'Clothing Rental', category: 'Other' },
  '7297': { code: '7297', description: 'Massage Parlors', category: 'Healthcare' },
  '7298': { code: '7298', description: 'Health and Beauty Spas', category: 'Healthcare' },

  // EDUCATION
  '8211': { code: '8211', description: 'Elementary, Secondary Schools', category: 'Other' },
  '8220': { code: '8220', description: 'Colleges, Universities', category: 'Other' },
  '8241': { code: '8241', description: 'Correspondence Schools', category: 'Other' },
  '8244': { code: '8244', description: 'Business Schools', category: 'Other' },
  '8249': { code: '8249', description: 'Vocational/Trade Schools', category: 'Other' },
  '8299': { code: '8299', description: 'Educational Services', category: 'Other' },

  // GOVERNMENT SERVICES
  '9211': { code: '9211', description: 'Court Costs, Including Alimony and Child Support', category: 'Other' },
  '9222': { code: '9222', description: 'Fines - Government Administrative Entities', category: 'Other' },
  '9311': { code: '9311', description: 'Tax Payments - Government Agencies', category: 'Other' },
  '9399': { code: '9399', description: 'Government Services', category: 'Other' },
  '9401': { code: '9401', description: 'Government Services', category: 'Other' },
  '9402': { code: '9402', description: 'Postal Services - Government Only', category: 'Other' },
  '9700': { code: '9700', description: 'Automated Referral Service', category: 'Other' },
  '9701': { code: '9701', description: 'Visa Credential Service', category: 'Other' },
  '9702': { code: '9702', description: 'Gcas Emergency Services', category: 'Other' },
  '9950': { code: '9950', description: 'Intra-Company Purchases', category: 'Other' }
};

export function getMCCCategory(mcc: string): string {
  const mapping = MCC_DATABASE[mcc];
  return mapping ? mapping.category : 'Other';
}

export function getMCCDescription(mcc: string): string {
  const mapping = MCC_DATABASE[mcc];
  return mapping ? mapping.description : 'Unknown MCC';
}

export function searchMCCByDescription(description: string): MCCMapping[] {
  const searchTerm = description.toLowerCase();
  return Object.values(MCC_DATABASE).filter(mcc => 
    mcc.description.toLowerCase().includes(searchTerm)
  );
} 