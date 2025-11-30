-- SQL statements to populate sample Indonesian stocks (IDX)
-- These are real stocks from the Indonesia Stock Exchange

INSERT INTO stocks (stock_symbol, company_name, sector, is_syariah, is_idx30, is_lq45) VALUES
-- Banking Sector
('BBCA', 'Bank Central Asia Tbk', 'Finance', false, true, true),
('BBRI', 'Bank Rakyat Indonesia Tbk', 'Finance', false, true, true),
('BMRI', 'Bank Mandiri Tbk', 'Finance', false, true, true),
('BBNI', 'Bank Negara Indonesia Tbk', 'Finance', false, true, true),
('BBTN', 'Bank Tabungan Negara Tbk', 'Finance', false, false, true),

-- Consumer Goods
('ICBP', 'Indofood CBP Sukses Makmur Tbk', 'Consumer Goods', true, true, true),
('INDF', 'Indofood Sukses Makmur Tbk', 'Consumer Goods', false, true, true),
('UNVR', 'Unilever Indonesia Tbk', 'Consumer Goods', false, true, true),
('KLBF', 'Kalbe Farma Tbk', 'Consumer Goods', true, true, true),
('MYOR', 'Mayora Indah Tbk', 'Consumer Goods', true, false, true),

-- Telecommunications
('TLKM', 'Telkom Indonesia Tbk', 'Telecommunications', true, true, true),
('EXCL', 'XL Axiata Tbk', 'Telecommunications', false, false, true),
('ISAT', 'Indosat Tbk', 'Telecommunications', false, false, false),

-- Mining & Energy
('ADRO', 'Adaro Energy Indonesia Tbk', 'Mining', false, true, true),
('PTBA', 'Bukit Asam Tbk', 'Mining', false, true, true),
('ITMG', 'Indo Tambangraya Megah Tbk', 'Mining', false, false, true),
('ANTM', 'Aneka Tambang Tbk', 'Mining', false, true, true),
('INCO', 'Vale Indonesia Tbk', 'Mining', false, false, true),

-- Infrastructure & Construction
('WIKA', 'Wijaya Karya Tbk', 'Infrastructure', true, false, true),
('WSKT', 'Waskita Karya Tbk', 'Infrastructure', false, false, false),
('PTPP', 'PP (Persero) Tbk', 'Infrastructure', true, false, true),
('ADHI', 'Adhi Karya Tbk', 'Infrastructure', true, false, false),

-- Technology
('GOTO', 'GoTo Gojek Tokopedia Tbk', 'Technology', false, true, true),
('BUKA', 'Bukalapak.com Tbk', 'Technology', false, false, false),
('EMTK', 'Elang Mahkota Teknologi Tbk', 'Technology', false, false, false),

-- Cement
('SMGR', 'Semen Indonesia Tbk', 'Basic Materials', false, true, true),
('INTP', 'Indocement Tunggal Prakarsa Tbk', 'Basic Materials', false, false, true),

-- Automotive
('ASII', 'Astra International Tbk', 'Automotive', false, true, true),
('AUTO', 'Astra Otoparts Tbk', 'Automotive', false, false, false),
('GJTL', 'Gajah Tunggal Tbk', 'Automotive', false, false, false),

-- Retail
('ACES', 'Ace Hardware Indonesia Tbk', 'Retail', false, false, true),
('MAPI', 'Mitra Adiperkasa Tbk', 'Retail', false, false, false),
('ERAA', 'Erajaya Swasembada Tbk', 'Retail', false, false, false),

-- Real Estate & Property
('BSDE', 'Bumi Serpong Damai Tbk', 'Property', true, false, true),
('PWON', 'Pakuwon Jati Tbk', 'Property', false, false, true),
('CTRA', 'Ciputra Development Tbk', 'Property', false, false, false);

-- Verify the inserted data
-- SELECT stock_symbol, company_name, sector, is_syariah, is_idx30, is_lq45 
-- FROM stocks 
-- ORDER BY sector, stock_symbol;

