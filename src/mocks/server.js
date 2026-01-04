// Simple mock server implementation (alternative to Mirage.js)
import poListData from "./poListData.json";
import poApprovalData from "./poApprovalData.json";
import { getToken } from "../utils/authHelper";

// Seed data for Item Master
const categories = [
  { id: 1, name: "Fabric" },
  { id: 2, name: "Trims" },
];

const subcategories = [
  { id: 1, categoryId: 1, name: "Knit" },
  { id: 2, categoryId: 1, name: "Woven" },
  { id: 3, categoryId: 2, name: "Button" },
  { id: 4, categoryId: 2, name: "Label" },
];

const itemTypes = [
  { id: 1, subCategoryId: 1, name: "Single Jersey" },
  { id: 2, subCategoryId: 1, name: "French Terry" },
  { id: 3, subCategoryId: 3, name: "Shell" },
  { id: 4, subCategoryId: 3, name: "Snap" },
  { id: 5, subCategoryId: 3, name: "Horn" },
  { id: 6, subCategoryId: 3, name: "Plastic" },
];

const attributes = [
  {
    id: 1,
    subCategoryId: 1,
    attribute_name: "GSM",
    data_type: "Number",
    applicable_type_ids: [1, 2],
    is_common: true,
  },
  {
    id: 2,
    subCategoryId: 1,
    attribute_name: "Width",
    data_type: "Text",
    applicable_type_ids: [1, 2],
    is_common: true,
  },
  {
    id: 3,
    subCategoryId: 1,
    attribute_name: "Color",
    data_type: "Text",
    applicable_type_ids: [1, 2],
    is_common: true,
  },
  {
    id: 4,
    subCategoryId: 3,
    attribute_name: "Size",
    data_type: "Number",
    applicable_type_ids: [3, 4, 5, 6],
    is_common: true,
  },
  {
    id: 5,
    subCategoryId: 3,
    attribute_name: "Holes",
    data_type: "Number",
    applicable_type_ids: [3, 4, 5, 6],
    is_common: true,
  },
  {
    id: 6,
    subCategoryId: 3,
    attribute_name: "Color",
    data_type: "Text",
    applicable_type_ids: [3, 4, 5, 6],
    is_common: true,
  },
  {
    id: 7,
    subCategoryId: 3,
    attribute_name: "Extra Specification",
    data_type: "Text",
    applicable_type_ids: [3, 4, 5, 6],
    is_common: false,
  },
];

const items = [
  {
    id: 1,
    itemCode: "BTN001",
    itemName: "Button - Shell 10L Red",
    categoryId: 2,
    subCategoryId: 3,
    itemTypeId: 3,
    uomId: "Pcs",
    hsnCode: "96062100",
    attributes: {
      4: "10",
      5: "2",
      6: "Red",
      7: "Logo embossed",
    },
    isActive: true,
    createdAt: "2024-01-15T10:30:00Z",
    unitPrice: 0.50,
  },
  {
    id: 2,
    itemCode: "BTN002",
    itemName: "Button - Shell 12L Blue",
    categoryId: 2,
    subCategoryId: 3,
    itemTypeId: 3,
    uomId: "Pcs",
    hsnCode: "96062100",
    attributes: {
      4: "12",
      5: "4",
      6: "Blue",
      7: "Matte finish",
    },
    isActive: true,
    createdAt: "2024-01-16T11:20:00Z",
    unitPrice: 0.60,
  },
  {
    id: 3,
    itemCode: "BTN003",
    itemName: "Button - Snap 14L Black",
    categoryId: 2,
    subCategoryId: 3,
    itemTypeId: 4,
    uomId: "Pcs",
    hsnCode: "96062200",
    attributes: {
      4: "14",
      5: "0",
      6: "Black",
      7: "Metal snap",
    },
    isActive: true,
    createdAt: "2024-01-18T09:15:00Z",
    unitPrice: 0.75,
  },
  {
    id: 4,
    itemCode: "BTN004",
    itemName: "Button - Horn 16L Brown",
    categoryId: 2,
    subCategoryId: 3,
    itemTypeId: 5,
    uomId: "Pcs",
    hsnCode: "96062900",
    attributes: {
      4: "16",
      5: "2",
      6: "Brown",
      7: "Natural horn",
    },
    isActive: true,
    createdAt: "2024-01-20T14:45:00Z",
    unitPrice: 1.20,
  },
  {
    id: 5,
    itemCode: "BTN005",
    itemName: "Button - Plastic 18L White",
    categoryId: 2,
    subCategoryId: 3,
    itemTypeId: 6,
    uomId: "Pcs",
    hsnCode: "96062100",
    attributes: {
      4: "18",
      5: "4",
      6: "White",
      7: "Glossy finish",
    },
    isActive: true,
    createdAt: "2024-01-22T16:30:00Z",
    unitPrice: 0.30,
  },
  {
    id: 6,
    itemCode: "FAB001",
    itemName: "Single Jersey 180 GSM Navy",
    categoryId: 1,
    subCategoryId: 1,
    itemTypeId: 1,
    uomId: "Kg",
    hsnCode: "60019200",
    attributes: {
      1: "180",
      2: "72 inches",
      3: "Navy Blue",
    },
    isActive: true,
    createdAt: "2024-02-01T10:00:00Z",
    unitPrice: 12.50,
  },
  {
    id: 7,
    itemCode: "FAB002",
    itemName: "Single Jersey 160 GSM White",
    categoryId: 1,
    subCategoryId: 1,
    itemTypeId: 1,
    uomId: "Kg",
    hsnCode: "60019200",
    attributes: {
      1: "160",
      2: "60 inches",
      3: "White",
    },
    isActive: true,
    createdAt: "2024-02-03T11:30:00Z",
    unitPrice: 11.00,
  },
  {
    id: 8,
    itemCode: "FAB003",
    itemName: "French Terry 240 GSM Grey",
    categoryId: 1,
    subCategoryId: 1,
    itemTypeId: 2,
    uomId: "Kg",
    hsnCode: "60019200",
    attributes: {
      1: "240",
      2: "72 inches",
      3: "Grey Melange",
    },
    isActive: true,
    createdAt: "2024-02-05T09:45:00Z",
    unitPrice: 15.00,
  },
  {
    id: 9,
    itemCode: "FAB004",
    itemName: "French Terry 220 GSM Black",
    categoryId: 1,
    subCategoryId: 1,
    itemTypeId: 2,
    uomId: "Kg",
    hsnCode: "60019200",
    attributes: {
      1: "220",
      2: "72 inches",
      3: "Black",
    },
    isActive: true,
    createdAt: "2024-02-07T13:20:00Z",
    unitPrice: 14.50,
  },
  {
    id: 10,
    itemCode: "BTN006",
    itemName: "Button - Shell 20L Green",
    categoryId: 2,
    subCategoryId: 3,
    itemTypeId: 3,
    uomId: "Pcs",
    hsnCode: "96062100",
    attributes: {
      4: "20",
      5: "2",
      6: "Green",
      7: "Eco-friendly",
    },
    isActive: true,
    createdAt: "2024-02-10T15:10:00Z",
    unitPrice: 0.80,
  },
  {
    id: 11,
    itemCode: "FAB005",
    itemName: "Single Jersey 200 GSM Red",
    categoryId: 1,
    subCategoryId: 1,
    itemTypeId: 1,
    uomId: "Kg",
    hsnCode: "60019200",
    attributes: {
      1: "200",
      2: "72 inches",
      3: "Red",
    },
    isActive: true,
    createdAt: "2024-02-12T10:30:00Z",
    unitPrice: 13.00,
  },
  {
    id: 12,
    itemCode: "BTN007",
    itemName: "Button - Plastic 22L Yellow",
    categoryId: 2,
    subCategoryId: 3,
    itemTypeId: 6,
    uomId: "Pcs",
    hsnCode: "96062100",
    attributes: {
      4: "22",
      5: "4",
      6: "Yellow",
      7: "UV resistant",
    },
    isActive: true,
    createdAt: "2024-02-14T12:00:00Z",
    unitPrice: 0.40,
  },
  {
    id: 13,
    itemCode: "FAB006",
    itemName: "French Terry 260 GSM Maroon",
    categoryId: 1,
    subCategoryId: 1,
    itemTypeId: 2,
    uomId: "Kg",
    hsnCode: "60019200",
    attributes: {
      1: "260",
      2: "72 inches",
      3: "Maroon",
    },
    isActive: true,
    createdAt: "2024-02-16T14:30:00Z",
    unitPrice: 16.00,
  },
  {
    id: 14,
    itemCode: "BTN008",
    itemName: "Button - Horn 24L Beige",
    categoryId: 2,
    subCategoryId: 3,
    itemTypeId: 5,
    uomId: "Pcs",
    hsnCode: "96062900",
    attributes: {
      4: "24",
      5: "2",
      6: "Beige",
      7: "Premium quality",
    },
    isActive: true,
    createdAt: "2024-02-18T16:45:00Z",
    unitPrice: 1.50,
  },
  {
    id: 15,
    itemCode: "FAB007",
    itemName: "Single Jersey 170 GSM Pink",
    categoryId: 1,
    subCategoryId: 1,
    itemTypeId: 1,
    uomId: "Kg",
    hsnCode: "60019200",
    attributes: {
      1: "170",
      2: "60 inches",
      3: "Pink",
    },
    isActive: true,
    createdAt: "2024-02-20T09:00:00Z",
    unitPrice: 11.50,
  },
  {
    id: 16,
    itemCode: "BTN009",
    itemName: "Button - Snap 26L Silver",
    categoryId: 2,
    subCategoryId: 3,
    itemTypeId: 4,
    uomId: "Pcs",
    hsnCode: "96062200",
    attributes: {
      4: "26",
      5: "0",
      6: "Silver",
      7: "Rust resistant",
    },
    isActive: false,
    createdAt: "2024-02-22T11:15:00Z",
    unitPrice: 0.90,
  },
  {
    id: 17,
    itemCode: "FAB008",
    itemName: "French Terry 280 GSM Olive",
    categoryId: 1,
    subCategoryId: 1,
    itemTypeId: 2,
    uomId: "Kg",
    hsnCode: "60019200",
    attributes: {
      1: "280",
      2: "72 inches",
      3: "Olive Green",
    },
    isActive: true,
    createdAt: "2024-02-24T13:30:00Z",
    unitPrice: 17.00,
  },
  {
    id: 18,
    itemCode: "BTN010",
    itemName: "Button - Plastic 28L Orange",
    categoryId: 2,
    subCategoryId: 3,
    itemTypeId: 6,
    uomId: "Pcs",
    hsnCode: "96062100",
    attributes: {
      4: "28",
      5: "4",
      6: "Orange",
      7: "High impact",
    },
    isActive: true,
    createdAt: "2024-02-26T15:45:00Z",
    unitPrice: 0.50,
  },
  {
    id: 19,
    itemCode: "FAB009",
    itemName: "Single Jersey 190 GSM Turquoise",
    categoryId: 1,
    subCategoryId: 1,
    itemTypeId: 1,
    uomId: "Kg",
    hsnCode: "60019200",
    attributes: {
      1: "190",
      2: "72 inches",
      3: "Turquoise",
    },
    isActive: true,
    createdAt: "2024-02-28T10:20:00Z",
    unitPrice: 12.00,
  },
  {
    id: 20,
    itemCode: "BTN011",
    itemName: "Button - Shell 30L Purple",
    categoryId: 2,
    subCategoryId: 3,
    itemTypeId: 3,
    uomId: "Pcs",
    hsnCode: "96062100",
    attributes: {
      4: "30",
      5: "2",
      6: "Purple",
      7: "Metallic sheen",
    },
    isActive: true,
    createdAt: "2024-03-01T12:00:00Z",
    unitPrice: 1.00,
  },
];

// Mock data for suppliers
const suppliersData = [
  {
    id: 1,
    name: "Sushil Corporation",
    address: "123 Main St",
    city: "Mumbai",
    pincode: "400001",
    state: "Maharashtra",
    country: "India",
    pan: "ABCDE1234F",
    gstin: "22AAAAA0000A1Z5",
    email: "info@sushilcorp.com",
    phone: "+1-555-0101",
    fabric: true,
    trims: false,
    createdDate: "2024-01-15",
  },
  {
    id: 2,
    name: "Moorthy Industries",
    address: "456 Industrial Ave",
    city: "Bangalore",
    pincode: "560001",
    state: "Karnataka",
    country: "India",
    pan: "FGHIJ5678K",
    gstin: "29BBBBB0000B1Z6",
    email: "contact@moorthyind.com",
    phone: "+1-555-0102",
    fabric: false,
    trims: true,
    createdDate: "2024-02-20",
  },
  {
    id: 3,
    name: "Global Tech Solutions",
    address: "789 Tech Park",
    city: "Delhi",
    pincode: "110001",
    state: "Delhi",
    country: "India",
    pan: "KLMNO9012L",
    gstin: "07CCCCCC0000C1Z7",
    email: "sales@globaltech.com",
    phone: "+1-555-0103",
    fabric: true,
    trims: true,
    createdDate: "2024-03-10",
  },
  {
    id: 4,
    name: "Premium Parts Ltd",
    address: "321 Parts Blvd",
    city: "Chennai",
    pincode: "600001",
    state: "Tamil Nadu",
    country: "India",
    pan: "PQRST3456M",
    gstin: "33DDDDDD0000D1Z8",
    email: "orders@premiumparts.com",
    phone: "+1-555-0104",
    fabric: true,
    trims: false,
    createdDate: "2024-04-05",
  },
  {
    id: 5,
    name: "Industrial Supplies Co",
    address: "654 Supply Rd",
    city: "Kolkata",
    pincode: "700001",
    state: "West Bengal",
    country: "India",
    pan: "UVWXY7890N",
    gstin: "19EEEEEE0000E1Z9",
    email: "info@industrialsupplies.com",
    phone: "+1-555-0105",
    fabric: true,
    trims: false,
    createdDate: "2024-05-12",
  },
  {
    id: 6,
    name: "Textile Hub Pvt Ltd",
    address: "789 Textile Market",
    city: "Surat",
    pincode: "395002",
    state: "Gujarat",
    country: "India",
    pan: "ZABCD1234G",
    gstin: "24FFFFF0000F1Z0",
    email: "contact@textilehub.com",
    phone: "+1-555-0106",
    fabric: true,
    trims: false,
    createdDate: "2024-06-18",
  },
  {
    id: 7,
    name: "Fashion Accessories Inc",
    address: "456 Fashion Street",
    city: "Hyderabad",
    pincode: "500001",
    state: "Telangana",
    country: "India",
    pan: "HIJKL5678P",
    gstin: "36GGGGG0000G1Z1",
    email: "sales@fashionacc.com",
    phone: "+1-555-0107",
    fabric: false,
    trims: true,
    createdDate: "2024-07-22",
  },
  {
    id: 8,
    name: "Quality Fabrics Ltd",
    address: "321 Quality Lane",
    city: "Pune",
    pincode: "411001",
    state: "Maharashtra",
    country: "India",
    pan: "MNOPQ9012R",
    gstin: "27HHHHH0000H1Z2",
    email: "info@qualityfabrics.com",
    phone: "+1-555-0108",
    fabric: true,
    trims: false,
    createdDate: "2024-08-14",
  },
  {
    id: 9,
    name: "Modern Trims Co",
    address: "654 Modern Plaza",
    city: "Ahmedabad",
    pincode: "380001",
    state: "Gujarat",
    country: "India",
    pan: "RSTUV3456S",
    gstin: "24IIIII0000I1Z3",
    email: "orders@moderntrims.com",
    phone: "+1-555-0109",
    fabric: false,
    trims: true,
    createdDate: "2024-09-08",
  },
  {
    id: 10,
    name: "Elite Textiles",
    address: "987 Elite Tower",
    city: "Jaipur",
    pincode: "302001",
    state: "Rajasthan",
    country: "India",
    pan: "WXYZA7890T",
    gstin: "08JJJJJ0000J1Z4",
    email: "contact@elitetextiles.com",
    phone: "+1-555-0110",
    fabric: true,
    trims: true,
    createdDate: "2024-10-25",
  },
  {
    id: 11,
    name: "Budget Materials",
    address: "147 Budget Street",
    city: "Lucknow",
    pincode: "226001",
    state: "Uttar Pradesh",
    country: "India",
    pan: "BCDEF1234U",
    gstin: "09KKKKK0000K1Z5",
    email: "info@budgetmaterials.com",
    phone: "+1-555-0111",
    fabric: false,
    trims: true,
    createdDate: "2024-11-03",
  },
  {
    id: 12,
    name: "Premium Threads Ltd",
    address: "258 Thread Avenue",
    city: "Indore",
    pincode: "452001",
    state: "Madhya Pradesh",
    country: "India",
    pan: "GHIJK5678V",
    gstin: "23LLLLL0000L1Z6",
    email: "sales@premiumthreads.com",
    phone: "+1-555-0112",
    fabric: true,
    trims: false,
    createdDate: "2024-12-11",
  },
  {
    id: 13,
    name: "Classic Buttons Co",
    address: "369 Button Market",
    city: "Chandigarh",
    pincode: "160001",
    state: "Chandigarh",
    country: "India",
    pan: "LMNOP9012W",
    gstin: "04MMMMM0000M1Z7",
    email: "contact@classicbuttons.com",
    phone: "+1-555-0113",
    fabric: false,
    trims: true,
    createdDate: "2024-01-28",
  },
  {
    id: 14,
    name: "Designer Fabrics",
    address: "741 Designer Plaza",
    city: "Kochi",
    pincode: "682001",
    state: "Kerala",
    country: "India",
    pan: "QRSTU3456X",
    gstin: "32NNNNN0000N1Z8",
    email: "info@designerfabrics.com",
    phone: "+1-555-0114",
    fabric: true,
    trims: false,
    createdDate: "2024-02-16",
  },
  {
    id: 15,
    name: "Wholesale Trims",
    address: "852 Wholesale Hub",
    city: "Patna",
    pincode: "800001",
    state: "Bihar",
    country: "India",
    pan: "VWXYZ7890Y",
    gstin: "10OOOOO0000O1Z9",
    email: "orders@wholesaletrims.com",
    phone: "+1-555-0115",
    fabric: false,
    trims: true,
    createdDate: "2024-03-29",
  },
  {
    id: 16,
    name: "Luxury Textiles Inc",
    address: "963 Luxury Lane",
    city: "Bhubaneswar",
    pincode: "751001",
    state: "Odisha",
    country: "India",
    pan: "ABCDE1234Z",
    gstin: "21PPPPP0000P1Z0",
    email: "contact@luxurytextiles.com",
    phone: "+1-555-0116",
    fabric: true,
    trims: true,
    createdDate: "2024-04-17",
  },
  {
    id: 17,
    name: "Basic Supplies Ltd",
    address: "159 Basic Street",
    city: "Raipur",
    pincode: "492001",
    state: "Chhattisgarh",
    country: "India",
    pan: "FGHIJ5678A",
    gstin: "22QQQQQ0000Q1Z1",
    email: "info@basicsupplies.com",
    phone: "+1-555-0117",
    fabric: true,
    trims: false,
    createdDate: "2024-05-21",
  },
  {
    id: 18,
    name: "Advanced Materials",
    address: "357 Advanced Plaza",
    city: "Ranchi",
    pincode: "834001",
    state: "Jharkhand",
    country: "India",
    pan: "KLMNO9012B",
    gstin: "20RRRRR0000R1Z2",
    email: "sales@advancedmaterials.com",
    phone: "+1-555-0118",
    fabric: true,
    trims: false,
    createdDate: "2024-06-09",
  },
  {
    id: 19,
    name: "Specialty Trims Co",
    address: "468 Specialty Market",
    city: "Guwahati",
    pincode: "781001",
    state: "Assam",
    country: "India",
    pan: "PQRST3456C",
    gstin: "18SSSSS0000S1Z3",
    email: "contact@specialtytrims.com",
    phone: "+1-555-0119",
    fabric: false,
    trims: true,
    createdDate: "2024-07-14",
  },
  {
    id: 20,
    name: "Complete Solutions",
    address: "579 Complete Tower",
    city: "Shimla",
    pincode: "171001",
    state: "Himachal Pradesh",
    country: "India",
    pan: "UVWXY7890D",
    gstin: "02TTTTT0000T1Z4",
    email: "info@completesolutions.com",
    phone: "+1-555-0120",
    fabric: true,
    trims: true,
    createdDate: "2024-08-26",
  },
  {
    id: 21,
    name: "Eco-Friendly Fabrics",
    address: "681 Eco Plaza",
    city: "Dehradun",
    pincode: "248001",
    state: "Uttarakhand",
    country: "India",
    pan: "ZABCD1234E",
    gstin: "05UUUUU0000U1Z5",
    email: "contact@ecofabrics.com",
    phone: "+1-555-0121",
    fabric: true,
    trims: false,
    createdDate: "2024-09-13",
  },
  {
    id: 22,
    name: "Premium Accessories",
    address: "792 Premium Street",
    city: "Srinagar",
    pincode: "190001",
    state: "Jammu and Kashmir",
    country: "India",
    pan: "HIJKL5678F",
    gstin: "01VVVVV0000V1Z6",
    email: "sales@premiumacc.com",
    phone: "+1-555-0122",
    fabric: false,
    trims: true,
    createdDate: "2024-10-07",
  },
  {
    id: 23,
    name: "Smart Textiles Ltd",
    address: "813 Smart Tower",
    city: "Panaji",
    pincode: "403001",
    state: "Goa",
    country: "India",
    pan: "MNOPQ9012G",
    gstin: "30WWWWW0000W1Z7",
    email: "info@smarttextiles.com",
    phone: "+1-555-0123",
    fabric: true,
    trims: false,
    createdDate: "2024-11-19",
  },
  {
    id: 24,
    name: "Bulk Trims Supplier",
    address: "924 Bulk Market",
    city: "Port Blair",
    pincode: "744101",
    state: "Andaman and Nicobar",
    country: "India",
    pan: "RSTUV3456H",
    gstin: "35XXXXX0000X1Z8",
    email: "orders@bulktrims.com",
    phone: "+1-555-0124",
    fabric: false,
    trims: true,
    createdDate: "2024-12-02",
  },
  {
    id: 25,
    name: "All-in-One Materials",
    address: "135 All-in-One Plaza",
    city: "Silvassa",
    pincode: "396230",
    state: "Dadra and Nagar Haveli",
    country: "India",
    pan: "WXYZA7890I",
    gstin: "26YYYYY0000Y1Z9",
    email: "contact@AllinOne.com",
    phone: "+1-555-0125",
    fabric: true,
    trims: true,
    createdDate: "2024-01-30",
  },
];

// Mock data for items
const itemsData = [
  {
    id: 1,
    name: "Laptop Computer",
    code: "ITEM001",
    description: "High-performance laptop for office use",
    uom: "pcs",
    unitPrice: 1200.0,
    category: "Electronics",
  },
  {
    id: 2,
    name: "Office Chair",
    code: "ITEM002",
    description: "Ergonomic office chair with lumbar support",
    uom: "pcs",
    unitPrice: 250.0,
    category: "Furniture",
  },
  {
    id: 3,
    name: "Printer Paper",
    code: "ITEM003",
    description: "A4 size printer paper, 80gsm, 500 sheets",
    uom: "reams",
    unitPrice: 8.5,
    category: "Stationery",
  },
  {
    id: 4,
    name: "USB Cable",
    code: "ITEM004",
    description: "USB 3.0 Type-A to Type-B cable, 2m length",
    uom: "pcs",
    unitPrice: 12.0,
    category: "Electronics",
  },
  {
    id: 5,
    name: "Coffee Beans",
    code: "ITEM005",
    description: "Premium arabica coffee beans, 1kg pack",
    uom: "kg",
    unitPrice: 25.0,
    category: "Pantry",
  },
  {
    id: 6,
    name: "Whiteboard Markers",
    code: "ITEM006",
    description: "Set of 4 colored whiteboard markers",
    uom: "sets",
    unitPrice: 15.0,
    category: "Stationery",
  },
  {
    id: 7,
    name: "Network Switch",
    code: "ITEM007",
    description: "24-port gigabit ethernet switch",
    uom: "pcs",
    unitPrice: 180.0,
    category: "Electronics",
  },
  {
    id: 8,
    name: "Cleaning Supplies",
    code: "ITEM008",
    description: "All-purpose cleaning solution, 5L bottle",
    uom: "liters",
    unitPrice: 22.0,
    category: "Maintenance",
  },
  {
    id: 9,
    name: "Wireless Mouse",
    code: "ITEM009",
    description: "Optical wireless mouse with USB receiver",
    uom: "pcs",
    unitPrice: 35.0,
    category: "Electronics",
  },
  {
    id: 10,
    name: "Desk Lamp",
    code: "ITEM010",
    description: "LED desk lamp with adjustable brightness",
    uom: "pcs",
    unitPrice: 45.0,
    category: "Furniture",
  },
  {
    id: 11,
    name: "Notebooks",
    code: "ITEM011",
    description: "Pack of 10 ruled notebooks, A4 size",
    uom: "packs",
    unitPrice: 18.0,
    category: "Stationery",
  },
  {
    id: 12,
    name: "HDMI Cable",
    code: "ITEM012",
    description: "High-speed HDMI cable, 2m length",
    uom: "pcs",
    unitPrice: 15.0,
    category: "Electronics",
  },
  {
    id: 13,
    name: "Green Tea",
    code: "ITEM013",
    description: "Premium green tea leaves, 500g pack",
    uom: "kg",
    unitPrice: 30.0,
    category: "Pantry",
  },
  {
    id: 14,
    name: "Permanent Markers",
    code: "ITEM014",
    description: "Set of 6 permanent markers, assorted colors",
    uom: "sets",
    unitPrice: 12.0,
    category: "Stationery",
  },
  {
    id: 15,
    name: "Router",
    code: "ITEM015",
    description: "Wireless router with 4 LAN ports",
    uom: "pcs",
    unitPrice: 85.0,
    category: "Electronics",
  },
  {
    id: 16,
    name: "Floor Cleaner",
    code: "ITEM016",
    description: "Concentrated floor cleaning solution, 5L",
    uom: "liters",
    unitPrice: 28.0,
    category: "Maintenance",
  },
  {
    id: 17,
    name: "Keyboard",
    code: "ITEM017",
    description: "Mechanical keyboard with RGB lighting",
    uom: "pcs",
    unitPrice: 95.0,
    category: "Electronics",
  },
  {
    id: 18,
    name: "Filing Cabinet",
    code: "ITEM018",
    description: "4-drawer metal filing cabinet",
    uom: "pcs",
    unitPrice: 180.0,
    category: "Furniture",
  },
  {
    id: 19,
    name: "Sticky Notes",
    code: "ITEM019",
    description: "Pack of 12 sticky note pads, various sizes",
    uom: "packs",
    unitPrice: 8.0,
    category: "Stationery",
  },
  {
    id: 20,
    name: "Power Strip",
    code: "ITEM020",
    description: "6-outlet power strip with surge protection",
    uom: "pcs",
    unitPrice: 25.0,
    category: "Electronics",
  },
  {
    id: 21,
    name: "Coffee Cups",
    code: "ITEM021",
    description: "Pack of 50 disposable coffee cups",
    uom: "packs",
    unitPrice: 12.0,
    category: "Pantry",
  },
  {
    id: 22,
    name: "Highlighters",
    code: "ITEM022",
    description: "Set of 5 fluorescent highlighters",
    uom: "sets",
    unitPrice: 10.0,
    category: "Stationery",
  },
  {
    id: 23,
    name: "External Hard Drive",
    code: "ITEM023",
    description: "1TB external hard drive with USB 3.0",
    uom: "pcs",
    unitPrice: 75.0,
    category: "Electronics",
  },
  {
    id: 24,
    name: "Air Freshener",
    code: "ITEM024",
    description: "Room air freshener spray, 300ml",
    uom: "bottles",
    unitPrice: 15.0,
    category: "Maintenance",
  },
  {
    id: 25,
    name: "Monitor Stand",
    code: "ITEM025",
    description: "Adjustable monitor stand with cable management",
    uom: "pcs",
    unitPrice: 40.0,
    category: "Furniture",
  },
];

// Mock data for terms and conditions
const termsConditionsData = [
  {
    id: 1,
    name: "Standard Terms",
    description: "Standard payment terms: Net 30 days from invoice date",
  },
  {
    id: 2,
    name: "Express Terms",
    description: "Express payment terms: Net 15 days from invoice date",
  },
  {
    id: 3,
    name: "Extended Terms",
    description: "Extended payment terms: Net 45 days from invoice date",
  },
  {
    id: 4,
    name: "Cash on Delivery",
    description: "Payment due upon delivery of goods",
  },
  {
    id: 5,
    name: "Advance Payment",
    description: "50% advance payment required before delivery",
  },
];

// Mock data for users
const usersData = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@example.com",
    role: "Admin",
    status: "Active",
    createdDate: "2024-01-01",
  },
  {
    id: 2,
    name: "Manager User",
    email: "manager@example.com",
    role: "Manager",
    status: "Active",
    createdDate: "2024-02-15",
  },
  {
    id: 3,
    name: "Viewer User",
    email: "viewer@example.com",
    role: "Viewer",
    status: "Inactive",
    createdDate: "2024-03-10",
  },
];

// Mock data for roles
const rolesData = [
  {
    id: 1,
    name: "Admin",
    description: "Full access to all features",
    status: "Active",
    createdDate: "2024-01-01",
    permissions: {
      "purchase-orders": {
        access: true,
        operations: { view: true, add: true, update: true, delete: true },
      },
      "po-approval": {
        access: true,
        operations: { view: true, add: true, update: true, delete: true },
      },
      "supplier-info": {
        access: true,
        operations: { view: true, add: true, update: true, delete: true },
      },
      "item-master": {
        access: true,
        operations: { view: true, add: true, update: true, delete: true },
      },
      users: {
        access: true,
        operations: { view: true, add: true, update: true, delete: true },
      },
      roles: {
        access: true,
        operations: { view: true, add: true, update: true, delete: true },
      },
      profile: {
        access: true,
        operations: { view: true, add: true, update: true, delete: true },
      },
    },
  },
  {
    id: 2,
    name: "Manager",
    description: "Can manage users and view reports",
    status: "Active",
    createdDate: "2024-01-01",
    permissions: {
      "purchase-orders": {
        access: true,
        operations: { view: true, add: true, update: true, delete: false },
      },
      "po-approval": {
        access: true,
        operations: { view: true, add: false, update: true, delete: false },
      },
      "supplier-info": {
        access: true,
        operations: { view: true, add: true, update: true, delete: false },
      },
      "item-master": {
        access: true,
        operations: { view: true, add: true, update: true, delete: false },
      },
      users: {
        access: true,
        operations: { view: true, add: true, update: true, delete: false },
      },
      roles: {
        access: false,
        operations: { view: false, add: false, update: false, delete: false },
      },
      profile: {
        access: true,
        operations: { view: true, add: false, update: true, delete: false },
      },
    },
  },
  {
    id: 3,
    name: "Viewer",
    description: "Read-only access",
    status: "Active",
    createdDate: "2024-01-01",
    permissions: {
      "purchase-orders": {
        access: true,
        operations: { view: true, add: false, update: false, delete: false },
      },
      "po-approval": {
        access: true,
        operations: { view: true, add: false, update: false, delete: false },
      },
      "supplier-info": {
        access: true,
        operations: { view: true, add: false, update: false, delete: false },
      },
      "item-master": {
        access: true,
        operations: { view: true, add: false, update: false, delete: false },
      },
      users: {
        access: false,
        operations: { view: false, add: false, update: false, delete: false },
      },
      roles: {
        access: false,
        operations: { view: false, add: false, update: false, delete: false },
      },
      profile: {
        access: true,
        operations: { view: true, add: false, update: true, delete: false },
      },
    },
  },
];

// Mock server class
class MockServer {
  constructor() {
    this.routes = new Map();
    this.namespace = "/api";
    this.timing = Math.floor(Math.random() * 300) + 300; // Random delay 300-600ms
  }

  // Configure GET route
  get(path, handler) {
    this.routes.set(`GET ${path}`, handler);
  }

  // Configure POST route
  post(path, handler) {
    this.routes.set(`POST ${path}`, handler);
  }

  // Configure PUT route
  put(path, handler) {
    this.routes.set(`PUT ${path}`, handler);
  }

  // Configure DELETE route
  delete(path, handler) {
    this.routes.set(`DELETE ${path}`, handler);
  }

  // Handle requests
  async handleRequest(method, path, data = null) {
    // Strip query parameters from path for matching
    const basePath = path.split("?")[0];
    const routeKey = `${method} ${basePath}`;
    let handler = this.routes.get(routeKey);

    if (!handler) {
      // Check for parameterized routes
      const pathSegments = basePath.split("/").filter(Boolean);

      const methodRoutes = Array.from(this.routes.keys()).filter((key) =>
        key.startsWith(`${method} `)
      );

      for (const routeKey of methodRoutes) {
        const routePath = routeKey.split(" ")[1];
        const routeSegments = routePath.split("/").filter(Boolean);

        if (routeSegments.length === pathSegments.length) {
          const params = {};
          let match = true;
          for (let i = 0; i < routeSegments.length; i++) {
            if (routeSegments[i].startsWith(":")) {
              params[routeSegments[i].slice(1)] = pathSegments[i];
            } else if (routeSegments[i] !== pathSegments[i]) {
              match = false;
              break;
            }
          }
          if (match) {
            // Parse query parameters
            const queryParams = new URLSearchParams(path.split("?")[1] || "");
            for (const [key, value] of queryParams) {
              params[key] = value;
            }
            handler = this.routes.get(routeKey);
            return handler(data, params);
          }
        }
      }
      throw new Error(`Route ${routeKey} not found`);
    }

    // Parse query parameters for exact match routes
    const params = {};
    const queryParams = new URLSearchParams(path.split("?")[1] || "");
    for (const [key, value] of queryParams) {
      params[key] = value;
    }

    // Add delay to simulate network request
    await new Promise((resolve) => setTimeout(resolve, this.timing));

    return handler(data, params);
  }
}

// Create server instance
const server = new MockServer();

// Start the mock server by overriding fetch
server.start = () => {
  const originalFetch = window.fetch;
  window.fetch = async (url, options = {}) => {
    const method = options.method || "GET";
    const fullPath = url
      .replace(window.location.origin, "")
      .replace("/api", "");
    const basePath = fullPath.split("?")[0];
    if (
      server.routes.has(`${method} ${basePath}`) ||
      server.routes.has(`${method} /${basePath}`) ||
      Array.from(server.routes.keys()).some((k) => k.startsWith(`${method} `)) // Check if any route matches method for parameterized check
    ) {
      try {
        const response = await server.handleRequest(
          method,
          fullPath,
          options.body ? JSON.parse(options.body) : null
        );
        return new Response(JSON.stringify(response), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Mock Server Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
    return originalFetch(url, options);
  };
};

// Start the server
// server.start();


// Define routes
server.get("/po-list", () => {
  return {
    data: poListData,
    total: poListData.length,
    page: 1,
    per_page: poListData.length,
  };
});

server.get("/suppliers", () => {
  return {
    data: suppliersData,
    total: suppliersData.length,
  };
});

server.post("/suppliers", (data) => {
  const newSupplier = {
    id: Math.max(...suppliersData.map((s) => s.id)) + 1,
    name: data.name,
    address: data.address,
    city: data.city,
    pincode: data.pincode,
    state: data.state,
    country: data.country,
    pan: data.pan,
    gstin: data.gstin,
    email: data.email,
    phone: data.phone,
    fabric: data.fabric || false,
    trims: data.trims || false,
    createdDate: new Date().toISOString().split("T")[0],
  };
  suppliersData.push(newSupplier);
  return {
    success: true,
    data: newSupplier,
    message: "Supplier created successfully",
  };
});

server.put("/suppliers/:id", (data, params) => {
  const supplierId = parseInt(params.id);
  const supplierIndex = suppliersData.findIndex((s) => s.id === supplierId);
  if (supplierIndex === -1) {
    throw new Error("Supplier not found");
  }
  const updatedSupplier = {
    ...suppliersData[supplierIndex],
    name: data.name,
    address: data.address,
    city: data.city,
    pincode: data.pincode,
    state: data.state,
    country: data.country,
    pan: data.pan,
    gstin: data.gstin,
    email: data.email,
    phone: data.phone,
    fabric: data.fabric || false,
    trims: data.trims || false,
  };
  suppliersData[supplierIndex] = updatedSupplier;
  return {
    success: true,
    data: updatedSupplier,
    message: "Supplier updated successfully",
  };
});

server.delete("/suppliers/:id", (data, params) => {
  const supplierId = parseInt(params.id);
  const supplierIndex = suppliersData.findIndex((s) => s.id === supplierId);
  if (supplierIndex === -1) {
    throw new Error("Supplier not found");
  }
  const deletedSupplier = suppliersData.splice(supplierIndex, 1)[0];
  return {
    success: true,
    data: deletedSupplier,
    message: "Supplier deleted successfully",
  };
});

server.get("/items", () => {
  return {
    data: itemsData,
    total: itemsData.length,
  };
});

// Item Master routes
server.get("/categories", () => {
  return {
    data: categories,
    total: categories.length,
  };
});

server.get("/subcategories", (data, params) => {
  const categoryId = parseInt(params.categoryId);
  const filtered = subcategories.filter((sc) => sc.categoryId === categoryId);
  return {
    data: filtered,
    total: filtered.length,
  };
});

server.get("/item-types", (data, params) => {
  const subCategoryId = parseInt(params.subCategoryId);
  const filtered = itemTypes.filter((it) => it.subCategoryId === subCategoryId);
  return {
    data: filtered,
    total: filtered.length,
  };
});

server.get("/attributes", (data, params) => {
  const subCategoryId = parseInt(params.subCategoryId);
  const typeId = parseInt(params.typeId);
  const filtered = attributes.filter(
    (attr) =>
      attr.subCategoryId === subCategoryId &&
      (attr.applicable_type_ids.includes(typeId) || attr.is_common)
  );
  return {
    data: filtered,
    total: filtered.length,
  };
});

server.get("/items", () => {
  return {
    data: items,
    total: items.length,
  };
});

server.get("/items/:id", (data, params) => {
  const itemId = parseInt(params.id);
  const item = items.find((i) => i.id === itemId);
  if (!item) {
    throw new Error("Item not found");
  }
  return {
    data: item,
    success: true,
  };
});

server.post("/items/check-duplicate", (data) => {
  const { categoryId, subCategoryId, itemTypeId, attributes } = data;
  const existing = items.find(
    (item) =>
      item.categoryId === categoryId &&
      item.subCategoryId === subCategoryId &&
      item.itemTypeId === itemTypeId &&
      attributes.every(
        (attr) => item.attributes[attr.attributeId] === attr.value
      )
  );
  return {
    isDuplicate: !!existing,
    existingItemCode: existing ? existing.itemCode : null,
  };
});

server.post("/items", (data) => {
  const maxId = items.length > 0 ? Math.max(...items.map((i) => i.id)) : 0;
  const newId = maxId + 1;
  const newItem = {
    id: newId,
    itemCode: `ITEM${String(newId).padStart(3, "0")}`,
    itemName: data.itemName,
    categoryId: data.categoryId,
    subCategoryId: data.subCategoryId,
    itemTypeId: data.itemTypeId,
    uomId: data.uomId,
    hsnCode: data.hsnCode,
    isActive: data.isActive,
    attributes: data.attributes.reduce((acc, attr) => {
      acc[attr.attributeId] = attr.value;
      return acc;
    }, {}),
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  return {
    success: true,
    data: newItem,
    message: "Item created successfully",
  };
});

server.put("/items/:id", (data, params) => {
  const itemId = parseInt(params.id);
  const itemIndex = items.findIndex((i) => i.id === itemId);
  if (itemIndex === -1) {
    throw new Error("Item not found");
  }
  const updatedItem = {
    ...items[itemIndex],
    itemName: data.itemName,
    categoryId: data.categoryId,
    subCategoryId: data.subCategoryId,
    itemTypeId: data.itemTypeId,
    uomId: data.uomId,
    hsnCode: data.hsnCode,
    isActive: data.isActive,
    attributes: data.attributes.reduce((acc, attr) => {
      acc[attr.attributeId] = attr.value;
      return acc;
    }, {}),
  };
  items[itemIndex] = updatedItem;
  return {
    success: true,
    data: updatedItem,
    message: "Item updated successfully",
  };
});

server.delete("/items/:id", (data, params) => {
  const itemId = parseInt(params.id);
  const itemIndex = items.findIndex((i) => i.id === itemId);
  if (itemIndex === -1) {
    throw new Error("Item not found");
  }
  const deletedItem = items.splice(itemIndex, 1)[0];
  return {
    success: true,
    data: deletedItem,
    message: "Item deleted successfully",
  };
});

// Users routes
server.get("/users", () => {
  return {
    data: usersData,
    total: usersData.length,
  };
});

server.post("/users", (data) => {
  const newUser = {
    id: Math.max(...usersData.map((u) => u.id), 0) + 1,
    name: data.name,
    email: data.email,
    role: data.role,
    status: data.status || "Active",
    createdDate: new Date().toISOString().split("T")[0],
  };
  usersData.push(newUser);
  return {
    success: true,
    data: newUser,
    message: "User created successfully",
  };
});

server.put("/users/:id", (data, params) => {
  const userId = parseInt(params.id);
  const userIndex = usersData.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    throw new Error("User not found");
  }
  const updatedUser = {
    ...usersData[userIndex],
    name: data.name,
    email: data.email,
    role: data.role,
    status: data.status,
  };
  usersData[userIndex] = updatedUser;
  return {
    success: true,
    data: updatedUser,
    message: "User updated successfully",
  };
});

server.delete("/users/:id", (data, params) => {
  const userId = parseInt(params.id);
  const userIndex = usersData.findIndex((u) => u.id === userId);
  if (userIndex === -1) {
    throw new Error("User not found");
  }
  const deletedUser = usersData.splice(userIndex, 1)[0];
  return {
    success: true,
    data: deletedUser,
    message: "User deleted successfully",
  };
});

// Roles routes
server.get("/roles", () => {
  return {
    data: rolesData,
    total: rolesData.length,
  };
});

server.post("/roles", (data) => {
  const newRole = {
    id: Math.max(...rolesData.map((r) => r.id), 0) + 1,
    name: data.name,
    description: data.description,
    status: data.status || "Active",
    permissions: data.permissions || {},
    createdDate: new Date().toISOString().split("T")[0],
  };
  rolesData.push(newRole);
  return {
    success: true,
    data: newRole,
    message: "Role created successfully",
  };
});

server.put("/roles/:id", (data, params) => {
  const roleId = parseInt(params.id);
  const roleIndex = rolesData.findIndex((r) => r.id === roleId);
  if (roleIndex === -1) {
    throw new Error("Role not found");
  }
  const updatedRole = {
    ...rolesData[roleIndex],
    name: data.name,
    description: data.description,
    status: data.status,
    permissions: data.permissions || rolesData[roleIndex].permissions || {},
  };
  rolesData[roleIndex] = updatedRole;
  return {
    success: true,
    data: updatedRole,
    message: "Role updated successfully",
  };
});

server.delete("/roles/:id", (data, params) => {
  const roleId = parseInt(params.id);
  const roleIndex = rolesData.findIndex((r) => r.id === roleId);
  if (roleIndex === -1) {
    throw new Error("Role not found");
  }
  const deletedRole = rolesData.splice(roleIndex, 1)[0];
  return {
    success: true,
    data: deletedRole,
    message: "Role deleted successfully",
  };
});

server.get("/terms-conditions", () => {
  return {
    data: termsConditionsData,
    total: termsConditionsData.length,
  };
});

server.post("/purchase-orders", (data) => {
  const newPO = {
    id: Math.max(...poListData.map((po) => po.id)) + 1,
    sl: String(
      Math.max(...poListData.map((po) => parseInt(po.sl))) + 1
    ).padStart(2, "0"),
    poNo: data.poNo,
    supplier:
      suppliersData.find((s) => s.id === data.supplierId) || suppliersData[0],
    poDate: data.poDate,
    expectedDeliveryDate: data.expectedDeliveryDate,
    remarks: data.remarks,
    lineItems: data.lineItems,
    subtotal: data.subtotal,
    tax: data.tax,
    grandTotal: data.grandTotal,
    totalValue: data.grandTotal,
    status: "Draft",
  };

  poListData.push(newPO);

  return {
    success: true,
    data: newPO,
    message: "Purchase Order created successfully",
  };
});

// PO Approval endpoints
server.get("/po-approval-list", () => {
  return {
    data: poApprovalData,
    total: poApprovalData.length,
    page: 1,
    per_page: poApprovalData.length,
  };
});

server.get("/po/:id", (data, params) => {
  const poId = parseInt(params.id);
  const po = poApprovalData.find((p) => p.id === poId);
  if (!po) {
    throw new Error("PO not found");
  }
  return {
    data: po,
    success: true,
  };
});

server.post("/po/:id/approve", (data, params) => {
  const poId = parseInt(params.id);
  const poIndex = poApprovalData.findIndex((p) => p.id === poId);
  if (poIndex === -1) {
    throw new Error("PO not found");
  }

  const po = poApprovalData[poIndex];
  po.status = "Approved";
  po.approvalHistory.push({
    id: po.approvalHistory.length + 1,
    action: "Approved",
    userId: data.userId,
    userName: data.userName,
    timestamp: new Date().toISOString(),
    comments: data.comments || "PO approved",
  });

  // Update workflow steps
  const currentStep = po.workflow.steps.find(
    (step) => step.status === "pending"
  );
  if (currentStep) {
    currentStep.status = "completed";
    currentStep.completedAt = new Date().toISOString();
    po.workflow.currentStep++;
  }

  return {
    success: true,
    data: po,
    message: "PO approved successfully",
  };
});

server.post("/po/:id/reject", (data, params) => {
  const poId = parseInt(params.id);
  const poIndex = poApprovalData.findIndex((p) => p.id === poId);
  if (poIndex === -1) {
    throw new Error("PO not found");
  }

  const po = poApprovalData[poIndex];
  po.status = "Rejected";
  po.rejectionReason = data.reason;
  po.rejectionCategory = data.category;
  po.approvalHistory.push({
    id: po.approvalHistory.length + 1,
    action: "Rejected",
    userId: data.userId,
    userName: data.userName,
    timestamp: new Date().toISOString(),
    comments: data.reason,
  });

  // Update workflow steps
  const currentStep = po.workflow.steps.find(
    (step) => step.status === "pending"
  );
  if (currentStep) {
    currentStep.status = "rejected";
    currentStep.completedAt = new Date().toISOString();
  }

  return {
    success: true,
    data: po,
    message: "PO rejected successfully",
  };
});

server.post("/po/bulk-approve", (data) => {
  const { poIds, userId, userName } = data;
  const approvedPOs = [];

  poIds.forEach((poId) => {
    const poIndex = poApprovalData.findIndex((p) => p.id === poId);
    if (poIndex !== -1 && poApprovalData[poIndex].status === "Pending") {
      const po = poApprovalData[poIndex];
      po.status = "Approved";
      po.approvalHistory.push({
        id: po.approvalHistory.length + 1,
        action: "Bulk Approved",
        userId: userId,
        userName: userName,
        timestamp: new Date().toISOString(),
        comments: "Bulk approved",
      });
      approvedPOs.push(po);
    }
  });

  return {
    success: true,
    data: approvedPOs,
    message: `${approvedPOs.length} POs approved successfully`,
  };
});

server.post("/po/bulk-reject", (data) => {
  const { poIds, userId, userName, reason, category } = data;
  const rejectedPOs = [];

  poIds.forEach((poId) => {
    const poIndex = poApprovalData.findIndex((p) => p.id === poId);
    if (poIndex !== -1 && poApprovalData[poIndex].status === "Pending") {
      const po = poApprovalData[poIndex];
      po.status = "Rejected";
      po.rejectionReason = reason;
      po.rejectionCategory = category;
      po.approvalHistory.push({
        id: po.approvalHistory.length + 1,
        action: "Bulk Rejected",
        userId: userId,
        userName: userName,
        timestamp: new Date().toISOString(),
        comments: reason,
      });
      rejectedPOs.push(po);
    }
  });

  return {
    success: true,
    data: rejectedPOs,
    message: `${rejectedPOs.length} POs rejected successfully`,
  };
});

server.post("/po/:id/comments", (data, params) => {
  const poId = parseInt(params.id);
  const poIndex = poApprovalData.findIndex((p) => p.id === poId);
  if (poIndex === -1) {
    throw new Error("PO not found");
  }

  const po = poApprovalData[poIndex];
  const newComment = {
    id: po.comments.length + 1,
    userId: data.userId,
    userName: data.userName,
    timestamp: new Date().toISOString(),
    message: data.message,
  };

  po.comments.push(newComment);

  return {
    success: true,
    data: newComment,
    message: "Comment added successfully",
  };
});

server.get("/po/export", (params) => {
  const format = params.format || "csv";
  return {
    success: true,
    data: {
      downloadUrl: `/api/downloads/po-list.${format}`,
      format: format,
      size: "245 KB",
    },
    message: `PO list exported as ${format.toUpperCase()}`,
  };
});

// PO Notes endpoints
server.post("/purchase-orders/:id/notes", (data, params) => {
  const poId = parseInt(params.id);
  const poIndex = poListData.findIndex((p) => p.id === poId);
  if (poIndex === -1) {
    throw new Error("PO not found");
  }

  const po = poListData[poIndex];
  if (!po.notes) {
    po.notes = [];
  }

  const newNote = {
    text: data.text,
    timestamp: data.timestamp,
    user: data.user,
    edited: false,
  };

  po.notes.push(newNote);

  return {
    success: true,
    data: newNote,
    message: "Note added successfully",
  };
});

server.put("/purchase-orders/:id/notes/:noteIndex", (data, params) => {
  const poId = parseInt(params.id);
  const noteIndex = parseInt(params.noteIndex);
  const poIndex = poListData.findIndex((p) => p.id === poId);

  if (poIndex === -1) {
    throw new Error("PO not found");
  }

  const po = poListData[poIndex];
  if (!po.notes || !po.notes[noteIndex]) {
    throw new Error("Note not found");
  }

  po.notes[noteIndex] = {
    ...po.notes[noteIndex],
    text: data.text,
    timestamp: data.timestamp,
    edited: true,
  };

  return {
    success: true,
    data: po.notes[noteIndex],
    message: "Note updated successfully",
  };
});

// Export server instance
export default server;



// Export convenience function for making requests
export const makeRequest = async (method, path, data = null) => {
  try {
    const headers = { "Content-Type": "application/json" };
    
    // Add Bearer token if available
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const options = {
      method,
      headers
    };
    if (data) {
      options.body = JSON.stringify(data);
    }
    const API_BASE_URL = "http://localhost:8088";
    const response = await fetch(`${API_BASE_URL}/api/v1${path}`, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Mock server error:", error);
    throw error;
  }
};

// Export specific API functions
export const getPOList = () => makeRequest("GET", "/po-list");
export const getPOApprovalList = () => makeRequest("GET", "/po-approval-list");
export const getPOById = (id) => makeRequest("GET", `/po/${id}`);
export const approvePO = (id, data) =>
  makeRequest("POST", `/po/${id}/approve`, data);
export const rejectPO = (id, data) =>
  makeRequest("POST", `/po/${id}/reject`, data);
export const bulkApprovePOs = (data) =>
  makeRequest("POST", "/po/bulk-approve", data);
export const bulkRejectPOs = (data) =>
  makeRequest("POST", "/po/bulk-reject", data);
export const addPOComment = (id, data) =>
  makeRequest("POST", `/po/${id}/comments`, data);
export const exportPOList = (format) =>
  makeRequest("GET", `/po/export?format=${format}`);

// Supplier API functions
export const getSuppliers = () => makeRequest("GET", "/suppliers");
export const createSupplier = (data) => makeRequest("POST", "/suppliers", data);
export const updateSupplier = (id, data) =>
  makeRequest("PUT", `/suppliers/${id}`, data);
export const deleteSupplier = (id) => makeRequest("DELETE", `/suppliers/${id}`);

// Item Master API functions
export const getCategories = () => makeRequest("GET", "/categories");
export const getSubcategories = (categoryId) =>
  makeRequest("GET", `/subcategories?categoryId=${categoryId}`);
export const getItemTypes = (subCategoryId) =>
  makeRequest("GET", `/item-types?subCategoryId=${subCategoryId}`);
export const getAttributes = (subCategoryId, typeId) =>
  makeRequest(
    "GET",
    `/attributes?subCategoryId=${subCategoryId}&typeId=${typeId}`
  );
export const getItems = () => makeRequest("GET", "/items");
export const getItemById = (id) => makeRequest("GET", `/items/${id}`);
export const checkDuplicateItem = (data) =>
  makeRequest("POST", "/items/check-duplicate", data);
export const createItem = (data) => makeRequest("POST", "/items", data);
export const updateItem = (id, data) =>
  makeRequest("PUT", `/items/${id}`, data);
export const deleteItem = (id) => makeRequest("DELETE", `/items/${id}`);

// User API functions
export const getUsers = () => makeRequest("GET", "/users");
export const createUser = (data) => makeRequest("POST", "/users", data);
export const updateUser = (id, data) =>
  makeRequest("PUT", `/users/${id}`, data);
export const deleteUser = (id) => makeRequest("DELETE", `/users/${id}`);

// Role API functions
export const getRoles = () => makeRequest("GET", "/roles");
export const createRole = (data) => makeRequest("POST", "/roles", data);
export const updateRole = (id, data) =>
  makeRequest("PUT", `/roles/${id}`, data);
export const deleteRole = (id) => makeRequest("DELETE", `/roles/${id}`);
