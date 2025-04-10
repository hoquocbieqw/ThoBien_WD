document.addEventListener('DOMContentLoaded', () => {
  const cartItemsContainer = document.getElementById('cart-items');
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  let cart = [];

  setupSearch();
  
  updateProductCards();

  addToCartButtons.forEach(button => {
    button.addEventListener('click', function() {
      const productCard = this.closest('.card');
      const productTitle = productCard.querySelector('.card-title').innerText;
      const productImgSrc = productCard.querySelector('img').src;

      const existingProduct = cart.find(item => item.title === productTitle);
      if (existingProduct) {
        existingProduct.quantity++;
      } else {
        cart.push({
          title: productTitle,
          img: productImgSrc,
          price: 50000,
          quantity: 1
        });
      }
      displayCart();
    });
  });

  setupCheckout();

  document.getElementById('contact-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
  const name = document.getElementById('product-name').value.trim();
  const price = document.getElementById('product-price').value.trim();
  const fileInput = document.getElementById('product-img');
  const file = fileInput.files[0];

  if (!file) {
    alert('Vui lòng chọn ảnh sản phẩm');
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const imgDataUrl = e.target.result;

    const product = { name, price, img: imgDataUrl };

    const reader = new FileReader();
reader.onload = function(e) {
  const imgDataUrl = e.target.result;
  const category = document.getElementById('product-category').value;
  const product = { name, price, img: imgDataUrl, category }

  if (editingIndex !== null) {
    products[editingIndex] = product;
    editingIndex = null;
    document.getElementById('save-product').textContent = 'Thêm';
    document.getElementById('cancel-edit').classList.add('d-none');
  } else {
    products.push(product);
  }

  localStorage.setItem('products', JSON.stringify(products));
  renderAdminProducts();
  renderDynamicProducts();

  document.getElementById('product-form').reset();
};

reader.readAsDataURL(document.getElementById('product-img').files[0]);

    localStorage.setItem('products', JSON.stringify(products));
    renderProducts();
    document.getElementById('product-form').reset();
  };

  reader.readAsDataURL(file);
  });

  renderDynamicProducts();

  function setupSearch() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Tìm kiếm sản phẩm...';
    searchInput.classList.add('form-control', 'mb-4');
    
    const searchResults = document.createElement('div');
    searchResults.classList.add('search-results');
    
    const productsSection = document.querySelector('#products .container');
    productsSection.insertBefore(searchInput, productsSection.firstChild);
    productsSection.insertBefore(searchResults, productsSection.children[1]);

    const allProducts = Array.from(document.querySelectorAll('.card')).map(card => ({
      title: card.querySelector('.card-title').innerText,
      element: card.closest('.col-md-4')
    }));

    searchInput.addEventListener('input', function() {
      const query = this.value.toLowerCase().trim();
      
      document.querySelectorAll('.tab-pane .col-md-4').forEach(col => {
        col.style.display = query === '' ? '' : 'none';
      });
      
      searchResults.style.display = query === '' ? 'none' : 'block';
      searchResults.innerHTML = '';
      
      if (query !== '') {
        const matchedProducts = allProducts.filter(product => 
          product.title.toLowerCase().includes(query)
        );
        
        matchedProducts.forEach(product => {
          product.element.style.display = '';
        });
        
        if (matchedProducts.length === 0) {
          searchResults.innerHTML = '<div class="p-3">Không tìm thấy sản phẩm</div>';
        }
      }
    });
  }

  function updateProductCards() {
    document.querySelectorAll('.card').forEach(card => {
      const cardBody = card.querySelector('.card-body');
      
      if (!card.querySelector('.product-price')) {
        const priceElement = document.createElement('p');
        priceElement.classList.add('product-price', 'text-success', 'fw-bold', 'mb-2');
        priceElement.textContent = '50.000 VND';
        
        const descText = cardBody.querySelector('.card-text');
        if (descText) cardBody.removeChild(descText);
        
        cardBody.insertBefore(priceElement, cardBody.querySelector('.add-to-cart'));
      }
    });
  }

  function displayCart() {
    cartItemsContainer.innerHTML = '';
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p>Giỏ hàng trống.</p>';
      return;
    }
    
    const cartTable = document.createElement('table');
    cartTable.classList.add('table');
    cartTable.innerHTML = `
      <thead>
        <tr>
          <th>Sản phẩm</th>
          <th>Giá</th>
          <th>Số lượng</th>
          <th>Thành tiền</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        ${cart.map((item, index) => `
          <tr>
            <td>
              <div class="d-flex align-items-center">
                <img src="${item.img}" alt="${item.title}" width="50" class="me-2">
                <span>${item.title}</span>
              </div>
            </td>
            <td>50.000 VND</td>
            <td>
              <div class="input-group" style="max-width: 120px">
                <button class="btn btn-outline-secondary decrease-qty" data-index="${index}">-</button>
                <input type="text" class="form-control text-center" value="${item.quantity}" readonly>
                <button class="btn btn-outline-secondary increase-qty" data-index="${index}">+</button>
              </div>
            </td>
            <td>${(item.price * item.quantity).toLocaleString()} VND</td>
            <td><button class="btn btn-danger btn-sm" data-index="${index}">Xóa</button></td>
          </tr>
        `).join('')}
      </tbody>
    `;
    
    cartItemsContainer.appendChild(cartTable);
    
    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    cartItemsContainer.insertAdjacentHTML('beforeend', `
      <div class="d-flex justify-content-end align-items-center mt-3">
        <h5 class="me-3">Tổng tiền: ${totalPrice.toLocaleString()} VND</h5>
        <button class="btn btn-success" id="proceed-to-checkout">Thanh toán</button>
      </div>
    `);

    document.querySelectorAll('[data-index]').forEach(btn => {
      btn.addEventListener('click', function() {
        const idx = parseInt(this.getAttribute('data-index'));
        
        if (this.classList.contains('increase-qty')) {
          cart[idx].quantity++;
        } else if (this.classList.contains('decrease-qty')) {
          if (cart[idx].quantity > 1) cart[idx].quantity--;
          else cart.splice(idx, 1);
        } else {
          cart.splice(idx, 1);
        }
        
        displayCart();
      });
    });
    
    document.getElementById('proceed-to-checkout')?.addEventListener('click', () => {
      document.location.href = '#checkout';
    });
  }

  function setupCheckout() {
    const checkoutForm = document.getElementById('checkout-form');
    const paymentMethodSelect = document.getElementById('paymentMethod');
    
    if (!paymentMethodSelect) return;
    
    paymentMethodSelect.innerHTML = `
      <option value="">Chọn phương thức thanh toán</option>
      <option value="cod">Thanh toán khi nhận hàng</option>
      <option value="vnpay">VNPay</option>
    `;
    
    if (!document.getElementById('vnpay-redirect-screen')) {
      document.body.insertAdjacentHTML('beforeend', `
        <div id="vnpay-redirect-screen">
          <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMjQgMjQiPgogIDxwYXRoIGZpbGw9IiMwMGEwZjIiIGQ9Ik03LDIwdjJIMXYtMmg2ek0yMSwxM3YySDEwdi0yaDF6TTcsMTN2Mkgxdi0yaDZ6TTIxLDd2Mkgxdi0yaDE2di0yaDR6Ii8+Cjwvc3ZnPgo=" alt="VNPay Logo">
          <h3>Đang chuyển hướng đến cổng thanh toán VNPay</h3>
          <div class="vnpay-loading">
            <div class="vnpay-loading-bar"></div>
          </div>
          <div class="vnpay-message">Vui lòng không đóng trình duyệt trong quá trình xử lý</div>
        </div>
      `);
    }

    paymentMethodSelect.addEventListener('change', function() {
      const vnpayButton = document.getElementById('vnpay-button');
      
      if (this.value === 'vnpay') {
        if (!vnpayButton) {
          checkoutForm.insertAdjacentHTML('beforeend', `
            <button type="button" id="vnpay-button" class="btn btn-primary mt-3">Thanh toán với VNPay</button>
          `);
          
          document.getElementById('vnpay-button').addEventListener('click', simulateVNPayPayment);
        }
      } else if (vnpayButton) {
        vnpayButton.remove();
      }
    });

    
checkoutForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = {
    name: document.getElementById('fullName').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    address: document.getElementById('address').value,
    cart: cart,
    total: total
  };

  const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  existingOrders.push(order);
  localStorage.setItem('orders', JSON.stringify(existingOrders));

  alert('Đặt hàng thành công! Cảm ơn bạn đã mua hàng tại Tobico Farm.');
  cart = [];
  displayCart();
  this.reset();
});
function renderDynamicProducts() {
  const dynamicContainer = document.getElementById('dynamic-products');
  if (!dynamicContainer) return;

  const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
  dynamicContainer.innerHTML = '';

  savedProducts.forEach(product => {
    const col = document.createElement('div');
    col.className = 'col-md-4 col-lg-3 mb-4';
    col.innerHTML = `
      <div class="card h-100 shadow-sm product-card">
        <img src="${product.img}" class="card-img-top" alt="${product.name}">
        <div class="card-body d-flex flex-column">
          <h6 class="card-title text-success">${product.name}</h6>
          <div class="product-price fw-bold mb-2">${Number(product.price).toLocaleString()} VND</div>
          <button class="btn btn-success add-to-cart w-100">Thêm vào giỏ hàng</button>
        </div>
      </div>
    `;
    dynamicContainer.appendChild(col);
  });

  // Gắn lại sự kiện "Thêm vào giỏ"
  document.querySelectorAll('#dynamic-products .add-to-cart').forEach(button => {
    button.addEventListener('click', function () {
      const productCard = this.closest('.card');
      const productTitle = productCard.querySelector('.card-title').innerText;
      const productImgSrc = productCard.querySelector('img').src;

      const existingProduct = cart.find(item => item.title === productTitle);
      if (existingProduct) {
        existingProduct.quantity++;
      } else {
        cart.push({
          title: productTitle,
          img: productImgSrc,
          price: parseInt(productCard.querySelector('.product-price').innerText.replace(/\D/g, '')) || 50000,
          quantity: 1
        });
      }
      displayCart();
    });
  });
}

// Gọi ngay khi trang tải
renderDynamicProducts();
  }

  function simulateVNPayPayment() {
    const vnpayScreen = document.getElementById('vnpay-redirect-screen');
    const loadingBar = document.querySelector('.vnpay-loading-bar');
    
    vnpayScreen.style.display = 'flex';
    
    let width = 0;
    const interval = setInterval(() => {
      if (width >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          vnpayScreen.innerHTML = `
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgwIiBoZWlnaHQ9IjE4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMjQgMjQiPgogIDxwYXRoIGZpbGw9IiMwMGEwZjIiIGQ9Ik03LDIwdjJIMXYtMmg2ek0yMSwxM3YySDEwdi0yaDF6TTcsMTN2Mkgxdi0yaDZ6TTIxLDd2Mkgxdi0yaDE2di0yaDR6Ii8+Cjwvc3ZnPgo=" alt="VNPay Logo">
            <h3>Thanh toán thành công!</h3>
            <p>Cảm ơn bạn đã mua hàng tại Tobico Farm</p>
            <button class="vnpay-btn" id="vnpay-done-btn">Quay lại trang chủ</button>
          `;
          
          document.getElementById('vnpay-done-btn').addEventListener('click', function() {
            vnpayScreen.style.display = 'none';
            cart = [];
            displayCart();
            document.getElementById('checkout-form').reset();
          });
        }, 1000);
      } else {
        width += 2;
        loadingBar.style.width = width + '%';
      }
    }, 50);
  }
});

function renderDynamicProducts() {
  const dynamicContainer = document.getElementById('dynamic-products');
  if (!dynamicContainer) return;

  const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
  dynamicContainer.innerHTML = '';

  savedProducts.forEach(product => {
    const col = document.createElement('div');
    col.className = 'col-md-4 col-lg-3 mb-4';
    col.innerHTML = `
      <div class="card h-100 shadow-sm product-card">
        <img src="${product.img}" class="card-img-top" alt="${product.name}">
        <div class="card-body d-flex flex-column">
          <h6 class="card-title text-success">${product.name}</h6>
          <div class="product-price fw-bold mb-2">${Number(product.price).toLocaleString()} VND</div>
          <button class="btn btn-success add-to-cart w-100">Thêm vào giỏ hàng</button>
        </div>
      </div>
    `;
    dynamicContainer.appendChild(col);
  });

  // Gắn lại nút thêm vào giỏ
  document.querySelectorAll('#dynamic-products .add-to-cart').forEach(button => {
    button.addEventListener('click', function () {
      const productCard = this.closest('.card');
      const productTitle = productCard.querySelector('.card-title').innerText;
      const productImgSrc = productCard.querySelector('img').src;
      const productPrice = parseInt(productCard.querySelector('.product-price').innerText.replace(/\D/g, ''));

      const existingProduct = cart.find(item => item.title === productTitle);
      if (existingProduct) {
        existingProduct.quantity++;
      } else {
        cart.push({
          title: productTitle,
          img: productImgSrc,
          price: productPrice || 50000,
          quantity: 1
        });
      }
      displayCart();
    });
  });
}
