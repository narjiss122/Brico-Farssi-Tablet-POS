import { useEffect, useMemo, useState } from 'react';
import {
  Armchair, ArrowLeft, Check, DoorClosed, Drill,
  Grid2X2, LampDesk, LockKeyhole, Minus, Package, Plus, Search, ShoppingBasket,
  ShoppingCart, SlidersHorizontal, Trash2, Utensils, X, Zap, CreditCard, LogOut,
  Banknote, Landmark, UserRound, RotateCcw, Layers, BadgeCheck,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { AUTH_SESSION_KEY } from './constants/auth';
import { LoginPage } from './components/login-page';

type Category = 'Cuisine' | 'Dressing' | 'Portes et serrures' | 'Quincaillerie de meubles' | 'Éclairage LED' | 'Accessoires';
type Variant = { label: string; ref: string; price: number };
type Product = { id: string; name: string; sku: string; brand: string; category: Category; price: number; unit: string; barcode?: string; variants?: Variant[]; image?: string; icon: 'wardrobe' | 'kitchen' | 'door' | 'furniture' | 'light' | 'hardware' };
type CartLine = { key: string; product: Product; variant?: Variant; quantity: number };
type Toast = { id: number; message: string };
type Payment = 'Espèces' | 'Carte bancaire' | 'Virement' | 'Crédit client';

const widths: Variant[] = [600, 700, 800, 900].map((width, index) => ({ label: `${width} mm`, ref: `W201-${width}`, price: [128, 139, 151, 165][index] }));
const variantsOf = (sku: string, labels: string[], prices: number[]): Variant[] => labels.map((label, i) => ({ label, ref: `${sku}-${String(i + 1).padStart(2, '0')}`, price: prices[i] }));
const products: Product[] = [
  { id:'w201', name:'Panier rotin W201', sku:'W201', brand:'Dorüm', category:'Dressing', price:128, unit:'pièce', image:'/products/w201.webp', icon:'wardrobe', barcode:'8699010201201', variants:widths },
  { id:'w220', name:'Panier rotin coulissant', sku:'W220', brand:'Dorüm', category:'Dressing', price:245, unit:'pièce', image:'/products/w220.webp', icon:'wardrobe', variants:widths.map((v,i)=>({...v,ref:`W220-${v.label.replace(' mm','')}`,price:[245,259,275,292][i]})) },
  { id:'w221', name:'Panier métallique', sku:'W221', brand:'Dorüm', category:'Dressing', price:119, unit:'pièce', image:'/products/w221.webp', icon:'wardrobe', variants:widths.map((v,i)=>({...v,ref:`W221-${v.label.replace(' mm','')}`,price:[119,129,139,149][i]})) },
  { id:'w222', name:'Porte-chaussures W222', sku:'W222', brand:'Dorüm', category:'Dressing', price:112, unit:'pièce', image:'/products/w222.webp', icon:'wardrobe', variants:widths.map((v,i)=>({...v,ref:`W222-${v.label.replace(' mm','')}`,price:[112,125,138,152][i]})) },
  { id:'w223', name:'Boîte de rangement en flanelle', sku:'W223', brand:'Dorüm', category:'Dressing', price:138, unit:'pièce', image:'/products/w223.webp', icon:'wardrobe', variants:widths.map((v,i)=>({...v,ref:`W223-${v.label.replace(' mm','')}`,price:[138,148,158,168][i]})) },
  { id:'w219', name:'Porte-pantalons extractible', sku:'W219', brand:'Dorüm', category:'Dressing', price:198, unit:'pièce', image:'/products/w219.webp', icon:'wardrobe', variants:widths.map((v,i)=>({...v,ref:`W219-${v.label.replace(' mm','')}`,price:[198,215,232,254][i]})) },
  { id:'w229', name:'Porte-pantalons latéral', sku:'W229', brand:'Dorüm', category:'Dressing', price:298, unit:'pièce', image:'/products/w229.webp', icon:'wardrobe', variants:variantsOf('W229',['500 mm','600 mm','700 mm','800 mm'],[298,315,330,345]) },
  { id:'w232', name:'Porte-cintres coulissant', sku:'W232', brand:'Dorüm', category:'Dressing', price:45, unit:'pièce', image:'/products/w232.webp', icon:'wardrobe' },
  { id:'w233', name:'Monte-charge de penderie', sku:'W233', brand:'Dorüm', category:'Dressing', price:420, unit:'pièce', image:'/products/w233.webp', icon:'wardrobe', variants:widths.map((v,i)=>({...v,ref:`W233-${v.label.replace(' mm','')}`,price:[420,440,465,490][i]})) },
  { id:'w234', name:'Porte-chaussures rotatif 360°', sku:'W234', brand:'Dorüm', category:'Dressing', price:720, unit:'pièce', image:'/products/w234.webp', icon:'wardrobe', variants:variantsOf('W234',['6 niveaux','8 niveaux','10 niveaux','12 niveaux'],[720,850,990,1120]) },
  { id:'w235', name:'Panier rotatif 3 couches', sku:'W235', brand:'Dorüm', category:'Dressing', price:560, unit:'set', image:'/products/w235.webp', icon:'wardrobe' },
  { id:'w236', name:'Panier rotatif 4 couches', sku:'W236', brand:'Dorüm', category:'Dressing', price:690, unit:'set', image:'/products/w236.webp', icon:'wardrobe' },
  { id:'w243', name:'Planche à repasser escamotable', sku:'W243', brand:'Dorüm', category:'Dressing', price:325, unit:'pièce', image:'/products/w243.webp', icon:'wardrobe', variants:variantsOf('W243',['400 mm','600 mm'],[325,355]) },
  { id:'w242', name:'Coffre-fort de dressing', sku:'W242', brand:'Dorüm', category:'Dressing', price:560, unit:'pièce', image:'/products/w242.webp', icon:'wardrobe', variants:variantsOf('W242',['500 mm','600 mm'],[560,690]) },
  { id:'y611', name:'Boîte multifonction en bois', sku:'Y611', brand:'Yue Wood', category:'Dressing', price:155, unit:'pièce', image:'/products/y611.webp', icon:'wardrobe', variants:widths.map((v,i)=>({...v,ref:`Y611-${v.label.replace(' mm','')}`,price:[155,168,182,199][i]})) },
  { id:'y614', name:'Panier de rangement en bois', sku:'Y614', brand:'Yue Wood', category:'Dressing', price:145, unit:'pièce', image:'/products/y614.webp', icon:'wardrobe', variants:widths.map((v,i)=>({...v,ref:`Y614-${v.label.replace(' mm','')}`,price:[145,158,172,188][i]})) },
  { id:'y616', name:'Porte-chaussures en bois', sku:'Y616', brand:'Yue Wood', category:'Dressing', price:225, unit:'pièce', image:'/products/y616.webp', icon:'wardrobe', variants:widths.map((v,i)=>({...v,ref:`Y616-${v.label.replace(' mm','')}`,price:[225,240,258,279][i]})) },
  { id:'s227a', name:'Barre de penderie LED à détection A', sku:'S227A', brand:'Dorüm', category:'Éclairage LED', price:68, unit:'mètre', image:'/products/led-rod.webp', icon:'light', barcode:'6111202227011', variants:variantsOf('S227A',['Champagne','Or brossé','Noir mat'],[68,74,74]) },
  { id:'s227b', name:'Barre de penderie LED à détection B', sku:'S227B', brand:'Dorüm', category:'Éclairage LED', price:74, unit:'mètre', image:'/products/led-rod.webp', icon:'light', barcode:'6111202227012', variants:variantsOf('S227B',['Champagne','Or brossé','Noir mat'],[74,79,79]) },
  { id:'led-driver', name:'Transformateur LED 12V', sku:'LED-12V-60W', brand:'Autres', category:'Éclairage LED', price:135, unit:'pièce', icon:'light' },
  { id:'led-strip', name:'Ruban LED 12V blanc', sku:'LED-RB-12', brand:'Autres', category:'Éclairage LED', price:49, unit:'mètre', icon:'light' },
  { id:'blum-hinge', name:'Charnière CLIP top BLUMOTION', sku:'71B3550', brand:'Blum', category:'Cuisine', price:42, unit:'pièce', icon:'kitchen', barcode:'9002617791762' },
  { id:'blum-plate', name:'Embases CLIP cruciformes', sku:'173H7100', brand:'Blum', category:'Cuisine', price:12, unit:'pièce', icon:'kitchen' },
  { id:'blum-tandem', name:'Coulisse TANDEM sortie totale', sku:'560H5000B', brand:'Blum', category:'Cuisine', price:215, unit:'paire', icon:'kitchen', variants:variantsOf('560H',['450 mm','500 mm','550 mm'],[215,235,255]) },
  { id:'blum-lift', name:'Compas relevable AVENTOS HK', sku:'20K2E00', brand:'Blum', category:'Cuisine', price:385, unit:'set', icon:'kitchen', variants:variantsOf('20K2',['Type 20K2','Type 20K4'],[385,425]) },
  { id:'drawer-kit', name:'Coulisses à billes soft-close', sku:'QF-450SC', brand:'Autres', category:'Cuisine', price:145, unit:'paire', icon:'kitchen', variants:variantsOf('QF-450',['350 mm','400 mm','450 mm','500 mm'],[125,135,145,159]) },
  { id:'cutlery', name:'Range-couverts extensible', sku:'ACC-EXT-01', brand:'Autres', category:'Cuisine', price:95, unit:'pièce', icon:'kitchen', variants:variantsOf('ACC-EXT',['Blanc','Anthracite'],[95,108]) },
  { id:'lock-mortise', name:'Serrure à larder 3 points', sku:'SER-3P-85', brand:'Autres', category:'Portes et serrures', price:185, unit:'pièce', icon:'door', barcode:'6111208515038' },
  { id:'lock-cylinder', name:'Cylindre européen laiton', sku:'CYL-30X30', brand:'Autres', category:'Portes et serrures', price:89, unit:'pièce', icon:'door', variants:variantsOf('CYL-3030',['30 × 30 mm','30 × 40 mm','40 × 40 mm'],[89,105,119]) },
  { id:'handle-set', name:'Béquille sur rosace inox', sku:'POI-RS-INOX', brand:'Autres', category:'Portes et serrures', price:165, unit:'paire', icon:'door', variants:variantsOf('POI-RS',['Inox brossé','Noir mat','Champagne'],[165,179,195]) },
  { id:'door-stop', name:'Butée de porte au sol', sku:'BUT-INOX-01', brand:'Autres', category:'Portes et serrures', price:38, unit:'pièce', icon:'door' },
  { id:'hinge-door', name:'Paumelle de porte renforcée', sku:'PAU-140-G', brand:'Autres', category:'Portes et serrures', price:48, unit:'pièce', icon:'door', variants:variantsOf('PAU-140',['Gauche','Droite'],[48,48]) },
  { id:'knob', name:'Bouton de meuble laiton brossé', sku:'BOUT-LA-32', brand:'Autres', category:'Quincaillerie de meubles', price:28, unit:'pièce', icon:'furniture' },
  { id:'pull-handle', name:'Poignée meuble profilée', sku:'POI-PRO-160', brand:'Autres', category:'Quincaillerie de meubles', price:55, unit:'pièce', icon:'furniture', variants:variantsOf('POI-PRO',['Noir mat','Inox brossé','Champagne'],[55,59,65]) },
  { id:'cam-lock', name:'Verrou excentrique 15 mm', sku:'VER-EXC-15', brand:'Autres', category:'Quincaillerie de meubles', price:8, unit:'pièce', icon:'furniture' },
  { id:'shelf-pin', name:'Taquet d’étagère nickelé', sku:'TQ-5-NI', brand:'Autres', category:'Quincaillerie de meubles', price:1.5, unit:'pièce', icon:'furniture' },
  { id:'furniture-leg', name:'Pied de meuble réglable', sku:'PIED-100', brand:'Autres', category:'Quincaillerie de meubles', price:22, unit:'pièce', icon:'furniture', variants:variantsOf('PIED',['80 mm','100 mm','120 mm'],[19,22,26]) },
  { id:'screw-box', name:'Vis bois tête fraisée 4 × 40', sku:'VIS-440-ZN', brand:'Autres', category:'Accessoires', price:34, unit:'boîte', icon:'hardware' },
  { id:'wall-plug', name:'Chevilles nylon assorties', sku:'CHEV-NYL-06', brand:'Autres', category:'Accessoires', price:22, unit:'boîte', icon:'hardware' },
  { id:'silicone', name:'Amortisseur adhésif transparent', sku:'AMO-TR-100', brand:'Autres', category:'Accessoires', price:12, unit:'sachet', icon:'hardware' },
];

const categoryList: { name: 'Tous les produits' | Category; icon: typeof Package; subtitle: string }[] = [
  { name:'Tous les produits', icon:Grid2X2, subtitle:'Tout le catalogue' },
  { name:'Cuisine', icon:Utensils, subtitle:'Ferrures & tiroirs' },
  { name:'Dressing', icon:Armchair, subtitle:'Rangement intérieur' },
  { name:'Portes et serrures', icon:DoorClosed, subtitle:'Fermeture & accès' },
  { name:'Quincaillerie de meubles', icon:Drill, subtitle:'Poignées & fixations' },
  { name:'Éclairage LED', icon:LampDesk, subtitle:'Spots & rubans' },
  { name:'Accessoires', icon:Layers, subtitle:'Petites fournitures' },
];

const formatMad = (amount: number) => `${amount.toLocaleString('fr-FR', { minimumFractionDigits: amount % 1 ? 2 : 0, maximumFractionDigits: 2 })} MAD`;
const ProductIcon = ({ type }: { type: Product['icon'] }) => {
  const Icon = type === 'wardrobe' ? Armchair : type === 'kitchen' ? Utensils : type === 'door' ? LockKeyhole : type === 'light' ? Zap : type === 'furniture' ? Drill : Package;
  return <Icon size={29} aria-hidden="true" />;
};

function App() {
  const [location, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => window.localStorage.getItem(AUTH_SESSION_KEY) === 'true',
  );

  useEffect(() => {
    if (isAuthenticated && location !== '/') setLocation('/');
    if (!isAuthenticated && location !== '/login') setLocation('/login');
  }, [isAuthenticated, location, setLocation]);

  if (!isAuthenticated) {
    return <LoginPage onSuccess={() => {
      window.localStorage.setItem(AUTH_SESSION_KEY, 'true');
      setIsAuthenticated(true);
      setLocation('/');
    }} />;
  }

  if (location !== '/') return null;

  return <PosScreen onLogout={() => {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
    setIsAuthenticated(false);
    setLocation('/login');
  }} />;
}

function PosScreen({ onLogout }: { onLogout: () => void }) {
  const [category, setCategory] = useState<string>('Tous les produits');
  const [brand, setBrand] = useState('Tous');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [payment, setPayment] = useState<Payment>('Espèces');
  const [cashReceived, setCashReceived] = useState('');
  const [discount, setDiscount] = useState('');
  const [clearOpen, setClearOpen] = useState(false);
  const [receipt, setReceipt] = useState<{ total: number; count: number; method: Payment; number: string } | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [compactCategories, setCompactCategories] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompactCategories(window.scrollY > 216);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    if (!toasts.length) return;
    const timer = window.setTimeout(() => setToasts((items) => items.slice(1)), 2300);
    return () => window.clearTimeout(timer);
  }, [toasts]);
  const filtered = useMemo(() => products.filter((item) => {
    const categoryMatch = category === 'Tous les produits' || item.category === category;
    const brandMatch = brand === 'Tous' || (brand === 'Autres' ? item.brand !== 'Dorüm' && item.brand !== 'Blum' : item.brand === brand);
    const q = query.trim().toLocaleLowerCase('fr');
    const queryMatch = !q || [item.name, item.sku, item.brand, item.barcode ?? '', ...(item.variants ?? []).map((v) => `${v.label} ${v.ref}`)].some((value) => value.toLocaleLowerCase('fr').includes(q));
    return categoryMatch && brandMatch && queryMatch;
  }), [category, brand, query]);
  const subtotal = cart.reduce((sum, line) => sum + (line.variant?.price ?? line.product.price) * line.quantity, 0);
  const discountAmount = Math.min(subtotal, Math.max(0, Number(discount.replace(',', '.')) || 0));
  const total = Math.max(0, subtotal - discountAmount);
  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const addLine = (product: Product, variant?: Variant) => {
    const key = `${product.id}:${variant?.ref ?? 'standard'}`;
    setCart((lines) => {
      const found = lines.find((line) => line.key === key);
      return found ? lines.map((line) => line.key === key ? { ...line, quantity: line.quantity + 1 } : line) : [...lines, { key, product, variant, quantity: 1 }];
    });
    setDrawerOpen(false);
    setToasts((items) => [...items, { id: Date.now(), message: `${product.name}${variant ? ` · ${variant.label}` : ''} ajouté` }]);
  };
  const requestAdd = (product: Product) => {
    if (product.variants?.length) {
      setVariantProduct(product);
      setSelectedVariant(product.variants[0]);
    } else addLine(product);
  };
  const setQuantity = (key: string, quantity: number) => setCart((lines) => lines.map((line) => line.key === key ? { ...line, quantity } : line).filter((line) => line.quantity > 0));
  const cashValue = Number(cashReceived.replace(',', '.')) || 0;
  const canConfirmPayment = payment !== 'Espèces' || cashValue >= total;
  const finishPayment = () => {
    setReceipt({ total, count: itemCount, method: payment, number: `BF-${Date.now().toString().slice(-6)}` });
    setPaymentOpen(false);
    setDrawerOpen(false);
    setCart([]);
    setDiscount('');
  };
  const startNewSale = () => {
    setCart([]);
    setDiscount('');
    setReceipt(null);
    setPayment('Espèces');
    setCashReceived('');
  };

  return (
    <div className="pos-shell">
      <header className="topbar">
        <div className="brand-lockup" data-testid="brand-lockup">
          <div className="brand-mark">BF</div>
          <div><div className="brand-name">Brico Farssi</div><div className="brand-sub">Quincaillerie & ferrures</div></div>
        </div>
        <div className="store-pill" data-testid="text-store"><span className="store-dot" />Magasin Tanger – Dar Tounsi</div>
        <div className="header-spacer" />
        <div className="employee"><span className="employee-avatar">CA</span><span>Caissier</span></div>
        <button
          className="logout-button"
          type="button"
          data-testid="button-logout"
          onClick={() => {
            if (itemCount > 0 && !window.confirm('Le panier contient des articles. Voulez-vous vraiment vous déconnecter ? Les articles en cours seront perdus.')) return;
            onLogout();
          }}
        ><LogOut size={15} /><span>Déconnexion</span></button>
        <div className="header-time" data-testid="text-register-status">Caisse ouverte</div>
      </header>

      <main className="workspace">
        <div className="catalog-head">
          <div>
            <div className="eyebrow">Point de vente <span style={{padding:'0 5px'}}>·</span> Catalogue</div>
            <h1 className="catalog-title">Nouvelle vente</h1>
            <p className="catalog-subtitle">Retrouvez vos articles et ajoutez-les à la caisse.</p>
          </div>
          <div className="catalog-actions">
            <label className="search-wrap">
              <Search size={17} aria-hidden="true" />
              <input aria-label="Rechercher un produit, une référence ou un code-barres" data-testid="input-product-search" type="search" placeholder="Nom, référence ou code-barres…" value={query} onChange={(e) => setQuery(e.target.value)} />
              <span className="search-shortcut">⌕</span>
            </label>
            <button className="cart-trigger" type="button" data-testid="button-open-cart" onClick={() => setDrawerOpen(true)} aria-label={`Ouvrir le panier, ${itemCount} articles`}>
              <ShoppingCart size={17} /><span className="cart-text">Panier</span><span className="cart-count" data-testid="text-cart-count">{itemCount}</span>
            </button>
          </div>
        </div>

        {compactCategories && <div className="sticky-category" data-testid="sticky-category-strip"><div className="category-rail">{categoryList.map(({name, icon: Icon}) => <button type="button" key={name} className={`category-card ${category === name ? 'active' : ''}`} data-testid={`sticky-category-${name === 'Tous les produits' ? 'all' : categoryList.indexOf(categoryList.find((c) => c.name === name)!)}`} onClick={() => setCategory(name)}><span className="category-icon"><Icon size={17}/></span><span className="category-label">{name === 'Tous les produits' ? 'Tous' : name}</span></button>)}</div></div>}
        <section className="category-section" aria-label="Catégories">
          <div className="category-rail">
            {categoryList.map(({ name, icon: Icon }) => {
              const count = name === 'Tous les produits' ? products.length : products.filter((p) => p.category === name).length;
              return <button type="button" className={`category-card ${category === name ? 'active' : ''}`} key={name} data-testid={`category-${name === 'Tous les produits' ? 'all' : name}`} aria-pressed={category === name} onClick={() => setCategory(name)}>
                <span className="category-image"><Icon size={23} strokeWidth={1.6} /></span><span className="category-copy"><span className="category-label">{name}</span><span className="category-count">{count} produits</span></span>
              </button>;
            })}
          </div>
        </section>
        <div className="filter-row" aria-label="Filtrer par marque">
          <span className="filter-label"><SlidersHorizontal size={13} style={{verticalAlign:'-2px',marginRight:5}}/>Marque</span>
          {['Tous','Dorüm','Blum','Autres'].map((name) => <button className={`brand-chip ${brand === name ? 'active' : ''}`} type="button" key={name} data-testid={`filter-brand-${name.toLowerCase()}`} aria-pressed={brand === name} onClick={() => setBrand(name)}>{name}</button>)}
          <span className="result-count" data-testid="text-result-count">{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
        </div>
        <section className="product-grid" aria-label="Produits" data-testid="product-grid">
          {filtered.length ? filtered.map((product) => <article className="product-card" key={product.id} data-testid={`card-product-${product.id}`}>
            <div className={`product-visual${product.image ? ' has-photo' : ''}`} aria-label={`Image du produit ${product.name}`}>
              {product.image ? <img className="product-photo" src={product.image} alt={product.name} data-testid={`img-product-${product.id}`} loading="lazy" /> : <ProductIcon type={product.icon} />}
              <span className="product-brand">{product.brand}</span>
            </div>
            <div className="product-info">
              <h2 className="product-name">{product.name}</h2><div className="product-sku" data-testid={`text-sku-${product.id}`}>Réf. {product.sku}</div>
            </div>
            <div className="product-bottom">
              <div><div className="product-price" data-testid={`text-price-${product.id}`}>{product.variants?.length ? <><small>à partir de </small>{formatMad(product.price)}</> : formatMad(product.price)}</div><div className="unit-label">/ {product.unit}</div></div>
              <button type="button" className="add-button" aria-label={`Ajouter ${product.name}`} data-testid={`button-add-${product.id}`} onClick={() => requestAdd(product)}><Plus size={19}/></button>
            </div>
          </article>) : <div className="empty-results" data-testid="empty-catalog">
            <div className="empty-inner"><div className="empty-symbol"><Search size={22}/></div><h3>Aucun article trouvé</h3><p>Essayez un autre nom ou une référence, ou réinitialisez les filtres pour parcourir le catalogue.</p><button type="button" className="text-button" data-testid="button-reset-filters" onClick={() => { setQuery(''); setCategory('Tous les produits'); setBrand('Tous'); }}>Effacer la recherche et les filtres</button></div>
          </div>}
        </section>
      </main>
      {cart.length > 0 && <div className="mobile-cart-bar" data-testid="mobile-cart-bar"><div className="mobile-cart-info"><strong>{formatMad(total)}</strong><span>{itemCount} article{itemCount > 1 ? 's' : ''} dans le panier</span></div><button className="primary-button" type="button" data-testid="button-mobile-cart" onClick={() => setDrawerOpen(true)}><ShoppingBasket size={17}/>Voir le panier</button></div>}

      {drawerOpen && <div className="overlay" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setDrawerOpen(false); }}>
        <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" data-testid="cart-drawer">
          <div className="drawer-head"><div><h2 className="drawer-title" id="cart-title">Panier de vente</h2><div className="drawer-subtitle" data-testid="text-drawer-item-count">{itemCount} article{itemCount > 1 ? 's' : ''} · Magasin Tanger</div></div><button className="icon-button" type="button" data-testid="button-close-cart" aria-label="Fermer le panier" onClick={() => setDrawerOpen(false)}><X size={18}/></button></div>
          <div className="drawer-body">
            {cart.length === 0 ? <div className="cart-empty" data-testid="empty-cart"><div className="cart-empty-icon"><ShoppingBasket size={25}/></div><strong>Votre panier est vide</strong><p>Ajoutez des articles depuis le catalogue.</p></div> : cart.map((line) => {
              const price = line.variant?.price ?? line.product.price;
              return <div className="cart-line" key={line.key} data-testid={`cart-line-${line.key}`}>
                <div><div className="line-name">{line.product.name}</div><div className="line-meta">{line.product.sku}{line.variant ? ` · ${line.variant.label} · ${line.variant.ref}` : ''}</div><div className="line-controls"><div className="qty-control"><button type="button" aria-label={`Diminuer ${line.product.name}`} data-testid={`button-quantity-minus-${line.key}`} onClick={() => setQuantity(line.key, line.quantity - 1)}><Minus size={13}/></button><span data-testid={`text-quantity-${line.key}`}>{line.quantity}</span><button type="button" aria-label={`Augmenter ${line.product.name}`} data-testid={`button-quantity-plus-${line.key}`} onClick={() => setQuantity(line.key, line.quantity + 1)}><Plus size={13}/></button></div><button type="button" className="remove-line" aria-label={`Retirer ${line.product.name}`} data-testid={`button-remove-${line.key}`} onClick={() => setCart((lines) => lines.filter((item) => item.key !== line.key))}><Trash2 size={14}/></button></div></div>
                <div className="line-right">{formatMad(price * line.quantity)}<div className="line-meta">{formatMad(price)} / {line.product.unit}</div></div>
              </div>;
            })}
          </div>
          <div className="drawer-foot">
            <div className="discount-row"><label htmlFor="discount-input">Remise (MAD)</label><input id="discount-input" className="discount-input" type="number" min="0" max={subtotal} placeholder="0" value={discount} data-testid="input-discount" onChange={(e) => setDiscount(e.target.value)}/></div>
            <div className="totals-line"><span>Sous-total</span><span data-testid="text-subtotal">{formatMad(subtotal)}</span></div>
            {discountAmount > 0 && <div className="totals-line"><span>Remise</span><span data-testid="text-discount">− {formatMad(discountAmount)}</span></div>}
            <div className="totals-line grand"><span>Total</span><span data-testid="text-total">{formatMad(total)}</span></div>
            <div className="drawer-actions"><button type="button" className="secondary-button" data-testid="button-clear-cart" disabled={!cart.length} onClick={() => setClearOpen(true)}><Trash2 size={15}/>Vider</button><button type="button" className="primary-button" data-testid="button-checkout" disabled={!cart.length} onClick={() => { setPaymentOpen(true); setCashReceived(''); }}><span>Encaisser</span><ArrowLeft size={16} style={{transform:'rotate(180deg)'}}/></button></div>
          </div>
        </aside>
      </div>}

      {variantProduct && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setVariantProduct(null); }}>
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="variant-title" data-testid="modal-variant-picker">
          <div className="modal-header"><div><h2 id="variant-title" className="modal-title">Choisir une variante</h2><div className="modal-description">{variantProduct.name} · Réf. {variantProduct.sku}</div></div><button type="button" className="icon-button" aria-label="Fermer" data-testid="button-close-variant" onClick={() => setVariantProduct(null)}><X size={17}/></button></div>
          <div className="modal-content"><div className="variant-options">{variantProduct.variants?.map((variant) => <button type="button" className={`variant-option ${selectedVariant?.ref === variant.ref ? 'selected' : ''}`} key={variant.ref} data-testid={`option-variant-${variant.ref}`} aria-pressed={selectedVariant?.ref === variant.ref} onClick={() => setSelectedVariant(variant)}><span><span className="variant-name">{variant.label}</span><span className="variant-ref">Réf. {variant.ref}</span></span><span className="variant-price">{formatMad(variant.price)}</span></button>)}</div></div>
          <div className="modal-footer"><button type="button" className="secondary-button" data-testid="button-cancel-variant" onClick={() => setVariantProduct(null)}>Annuler</button><button type="button" className="primary-button" data-testid="button-confirm-variant" disabled={!selectedVariant} onClick={() => { if (selectedVariant) addLine(variantProduct, selectedVariant); setVariantProduct(null); }}>Ajouter au panier</button></div>
        </section>
      </div>}

      {paymentOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setPaymentOpen(false); }}>
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="payment-title" data-testid="modal-checkout">
          <div className="modal-header"><div><h2 id="payment-title" className="modal-title">Encaisser la vente</h2><div className="modal-description">{itemCount} article{itemCount > 1 ? 's' : ''} · Paiement simulé</div></div><button type="button" className="icon-button" data-testid="button-close-checkout" aria-label="Fermer l’encaissement" onClick={() => setPaymentOpen(false)}><X size={17}/></button></div>
          <div className="modal-content">
            <div className="payment-total"><span>Montant à encaisser</span><strong data-testid="text-checkout-total">{formatMad(total)}</strong></div>
            <div className="payment-methods">{(['Espèces','Carte bancaire','Virement','Crédit client'] as Payment[]).map((method) => {
              const Icon = method === 'Espèces' ? Banknote : method === 'Carte bancaire' ? CreditCard : method === 'Virement' ? Landmark : UserRound;
              return <button type="button" key={method} className={`payment-method ${payment === method ? 'active' : ''}`} data-testid={`payment-method-${method.toLowerCase().replaceAll(' ','-')}`} aria-pressed={payment === method} onClick={() => setPayment(method)}><Icon size={18}/>{method}</button>;
            })}</div>
            {payment === 'Espèces' ? <><label className="field-label" htmlFor="cash-received">Montant reçu (MAD)</label><input className="field-input" id="cash-received" type="number" min={total} step="0.5" placeholder={total.toFixed(2)} value={cashReceived} data-testid="input-cash-received" onChange={(e) => setCashReceived(e.target.value)}/><div className="change-note"><span>Monnaie à rendre</span><strong data-testid="text-change-due">{formatMad(Math.max(0, cashValue - total))}</strong></div></> : payment === 'Crédit client' ? <div className="customer-note" data-testid="credit-note">Vente enregistrée en crédit client pour la démonstration. Aucun compte ni paiement réel ne sera créé.</div> : <div className="customer-note" data-testid="payment-note">Mode de paiement simulé — aucun paiement réel ne sera traité.</div>}
          </div>
          <div className="modal-footer"><button type="button" className="secondary-button" data-testid="button-cancel-checkout" onClick={() => setPaymentOpen(false)}>Retour au panier</button><button type="button" className="primary-button" data-testid="button-confirm-payment" disabled={!canConfirmPayment} onClick={finishPayment}><Check size={16}/>Confirmer la vente</button></div>
        </section>
      </div>}

      {clearOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setClearOpen(false); }}><section className="modal" role="alertdialog" aria-modal="true" aria-labelledby="clear-title" data-testid="modal-clear-cart">
        <div className="modal-header"><div><h2 className="modal-title" id="clear-title">Vider le panier ?</h2><div className="modal-description">Cette action retirera tous les articles de la vente en cours.</div></div><button type="button" className="icon-button" aria-label="Fermer" data-testid="button-close-clear" onClick={() => setClearOpen(false)}><X size={17}/></button></div>
        <div className="modal-content"><p className="confirm-copy">Le panier contient {itemCount} article{itemCount > 1 ? 's' : ''}. Vous pourrez toujours les ajouter à nouveau depuis le catalogue.</p></div>
        <div className="modal-footer"><button type="button" className="secondary-button" data-testid="button-cancel-clear" onClick={() => setClearOpen(false)}>Conserver</button><button type="button" className="primary-button" style={{background:'#a84940',borderColor:'#a84940'}} data-testid="button-confirm-clear" onClick={() => { setCart([]); setDiscount(''); setClearOpen(false); }}>Vider le panier</button></div>
      </section></div>}

      {receipt && <div className="modal-backdrop" role="presentation"><section className="modal" role="dialog" aria-modal="true" aria-labelledby="receipt-title" data-testid="modal-receipt">
        <div className="modal-content">
          <div className="receipt-summary"><div className="receipt-mark"><BadgeCheck size={26}/></div><h2 id="receipt-title">Vente enregistrée</h2><p>Merci, votre encaissement est terminé.</p></div>
          <div className="receipt-number">Reçu de démonstration · {receipt.number}<br/>Brico Farssi · Tanger – Dar Tounsi</div>
          <div style={{paddingTop:10}}><div className="receipt-row"><span>Articles</span><strong>{receipt.count}</strong></div><div className="receipt-row"><span>Mode de paiement</span><strong>{receipt.method}</strong></div><div className="receipt-row total"><span>Total réglé</span><strong data-testid="text-receipt-total">{formatMad(receipt.total)}</strong></div></div>
          <div className="receipt-actions"><button className="secondary-button" type="button" data-testid="button-receipt-close" onClick={() => setReceipt(null)}>Fermer</button><button className="primary-button" type="button" data-testid="button-new-sale" onClick={startNewSale}><RotateCcw size={16}/>Nouvelle vente</button></div>
        </div>
      </section></div>}

      <div className="toast-stack" aria-live="polite" data-testid="toast-stack">{toasts.map((toast) => <div className="toast-item" key={toast.id} data-testid="toast-added"><Check size={15}/>{toast.message}</div>)}</div>
    </div>
  );
}

export default App;
