    // Initialize inventory with default values.
    let inventory = {
      "Mellow Jalapeño": { stock: 24, price: 95 },
      "Original Peri Peri": { stock: 24, price: 95 },
      "Zesty Habanero": { stock: 24, price: 95 },
      "Extra Hot": { stock: 24, price: 95 }
    };

    let salesLog = [];
    let giftSetsSold = 0;
    let twoBottlePromotionsSold = 0;
    let cashSales = 0;

    // On page load, retrieve saved state and update inventory.
    window.addEventListener('load', () => {
      // Load saved state if available.
      const savedInventory = localStorage.getItem('inventory');
      const savedSalesLog = localStorage.getItem('salesLog');
      const savedCashSales = localStorage.getItem('cashSales');
      const savedMarketName = localStorage.getItem('marketName');
      const savedMarketSP = localStorage.getItem('marketSP');
      const savedMarketDate = localStorage.getItem('marketDate');
      const savedGiftSets = localStorage.getItem('giftSetsSold');
      const savedPromotions = localStorage.getItem('twoBottlePromotionsSold');

      if (savedInventory) {
        // Use the saved inventory (which reflects all changes)
        inventory = JSON.parse(savedInventory);
      } else {
        // Otherwise, if no inventory is saved, load initial stock config from separate keys.
        Object.keys(inventory).forEach(flavor => {
          const savedValue = localStorage.getItem(`stockConfig_${flavor}`);
          if (savedValue !== null) {
            inventory[flavor].stock = parseInt(savedValue);
          }
        });
      }

      if (savedSalesLog) salesLog = JSON.parse(savedSalesLog);
      if (savedCashSales) cashSales = JSON.parse(savedCashSales);
      if (savedGiftSets) giftSetsSold = parseInt(savedGiftSets);
      if (savedPromotions) twoBottlePromotionsSold = parseInt(savedPromotions);

      // Load market details
      if (savedMarketName) document.getElementById('marketName').value = savedMarketName;
      if (savedMarketDate) document.getElementById('marketDate').value = savedMarketDate;
      if (savedMarketSP) document.getElementById('marketSP').value = savedMarketSP;

      updateDashboard();
    });

    // Save state to localStorage
    function saveStateToLocalStorage() {
      localStorage.setItem('inventory', JSON.stringify(inventory));
      localStorage.setItem('salesLog', JSON.stringify(salesLog));
      localStorage.setItem('cashSales', JSON.stringify(cashSales));
      localStorage.setItem('giftSetsSold', giftSetsSold.toString());
      localStorage.setItem('twoBottlePromotionsSold', twoBottlePromotionsSold.toString());
      localStorage.setItem('marketName', document.getElementById('marketName').value);
      localStorage.setItem('marketDate', document.getElementById('marketDate').value);
      localStorage.setItem('marketSP', document.getElementById('marketSP').value);
      // Load marketSP from localStorage
     let savedMarketSP = localStorage.getItem('marketSP'); // Now it's defined

  if (savedMarketSP) {
    document.getElementById('marketSP').value = savedMarketSP;
  }
}

    // Toggle cash sales input visibility
    function toggleCashSalesInput() {
      const inputDiv = document.getElementById('cashSalesInput');
      inputDiv.style.display = inputDiv.style.display === 'none' ? 'block' : 'none';
    }

    // Log cash sales
    function logCashSales() {
      const amount = parseFloat(document.getElementById('cashAmount').value);
      const totalSales = salesLog.reduce((sum, sale) => sum + sale.total_price, 0);

      if (!isNaN(amount) && amount > 0) {
        if (amount > totalSales) {
          alert(`Error: Cash sales cannot exceed total sales of R${totalSales}`);
          return;
        }
        cashSales += amount;
        document.getElementById('cashAmount').value = '';
        toggleCashSalesInput();
        updateDashboard();
        saveStateToLocalStorage();
        alert(`Cash sales of R${amount} added.`);
      } else {
        alert('Please enter a valid cash amount.');
      }
    }

    // Update the dashboard display
    function updateDashboard() {
      const totalBottles = salesLog.reduce((sum, sale) => sum + sale.quantity, 0);
      const totalSales = salesLog.reduce((sum, sale) => sum + sale.total_price, 0);

      document.getElementById("totalBottles").textContent = totalBottles;
      document.getElementById("totalSales").textContent = `R${totalSales}`;

      const stockList = document.getElementById("stockList");
      stockList.innerHTML = Object.entries(inventory)
        .map(([flavor, data]) => {
          let stockText = "";
          let warningMsg = "";
          if (data.stock === 0) {
            stockText = "Out of Stock";
            warningMsg = `<div class="stock-warning">Out of Stock!</div>`;
          } else {
            stockText = `${data.stock} bottles`;
            if (data.stock <= 5) {
              warningMsg = `<div class="stock-warning">Low Stock!</div>`;
            }
          }
          return `<li class="${data.stock === 0 || data.stock <= 5 ? 'low-stock' : ''}">${flavor}: ${stockText}${warningMsg}</li>`;
        })
        .join("");
    }

    // Reset inventory and sales log
    function resetInventory() {
      if (confirm("Are you sure you want to reset the inventory and sales log?")) {
        inventory = {
          "Mellow Jalapeño": { stock: 24, price: 95 },
          "Original Peri Peri": { stock: 24, price: 95 },
          "Zesty Habanero": { stock: 24, price: 95 },
          "Extra Hot": { stock: 24, price: 95 }
        };
        salesLog = [];
        giftSetsSold = 0;
        twoBottlePromotionsSold = 0;
        cashSales = 0;

        // Clear market details
        document.getElementById('marketName').value = '';
        document.getElementById('marketDate').value = '';
        document.getElementById('marketSP').value = '';

        // Remove related localStorage items
        localStorage.removeItem('salesLog');
        localStorage.removeItem('cashSales');
        localStorage.removeItem('giftSetsSold');
        localStorage.removeItem('twoBottlePromotionsSold');
        localStorage.removeItem('marketName');
        localStorage.removeItem('marketDate');
        localStorage.removeItem('marketSP');

        updateDashboard();
        saveStateToLocalStorage();
        alert("Inventory and sales log have been reset.");
      }
    }

    // Add event listeners for market details
    document.getElementById('marketName').addEventListener('input', saveStateToLocalStorage);
    document.getElementById('marketDate').addEventListener('change', saveStateToLocalStorage);
    document.getElementById('marketSP').addEventListener('input', saveStateToLocalStorage);

    // Sales functions
    function logSale(flavor) {
      if (inventory[flavor].stock < 1) {
        alert(`Error: Not enough stock for ${flavor}`);
        return;
      }
      inventory[flavor].stock--;
      salesLog.push({ flavor, quantity: 1, total_price: 95 });
      updateDashboard();
      saveStateToLocalStorage();
      alert(`Sale logged: ${flavor} - 1 bottle sold for R95`);
    }

    function logPromotion() {
      const flavor1 = document.getElementById("promoFlavor1").value;
      const flavor2 = document.getElementById("promoFlavor2").value;
      if (flavor1 === flavor2) {
        if (inventory[flavor1].stock < 2) {
          alert(`Error: Need at least 2 bottles of ${flavor1}`);
          return;
        }
        inventory[flavor1].stock -= 2;
      } else {
        if (inventory[flavor1].stock < 1 || inventory[flavor2].stock < 1) {
          alert("Error: Not enough stock for selected flavors");
          return;
        }
        inventory[flavor1].stock--;
        inventory[flavor2].stock--;
      }
      salesLog.push({
        flavor: `${flavor1} & ${flavor2}`,
        quantity: 2,
        total_price: 180
      });
      twoBottlePromotionsSold++;
      updateDashboard();
      saveStateToLocalStorage();
      alert(`Promotion applied: ${flavor1} & ${flavor2} for R180`);
    }

    function createGiftSet() {
      const flavor1 = document.getElementById("giftFlavor1").value;
      const flavor2 = document.getElementById("giftFlavor2").value;
      if (flavor1 === flavor2) {
        if (inventory[flavor1].stock < 2) {
          alert(`Error: Need at least 2 bottles of ${flavor1}`);
          return;
        }
        inventory[flavor1].stock -= 2;
      } else {
        if (inventory[flavor1].stock < 1 || inventory[flavor2].stock < 1) {
          alert("Error: Not enough stock for selected flavors");
          return;
        }
        inventory[flavor1].stock--;
        inventory[flavor2].stock--;
      }
      salesLog.push({
        flavor: `${flavor1} & ${flavor2}`,
        quantity: 2,
        total_price: 200
      });
      giftSetsSold++;
      updateDashboard();
      saveStateToLocalStorage();
      alert(`Gift set created: ${flavor1} & ${flavor2} for R200`);
    }

    function createPrepackedGiftSet(flavor1, flavor2) {
      if (flavor1 === flavor2) {
        if (inventory[flavor1].stock < 2) {
          alert(`Error: Need at least 2 bottles of ${flavor1}`);
          return;
        }
        inventory[flavor1].stock -= 2;
      } else {
        if (inventory[flavor1].stock < 1 || inventory[flavor2].stock < 1) {
          alert("Error: Not enough stock for selected flavors");
          return;
        }
        inventory[flavor1].stock--;
        inventory[flavor2].stock--;
      }
      salesLog.push({
        flavor: `${flavor1} & ${flavor2}`,
        quantity: 2,
        total_price: 200
      });
      giftSetsSold++;
      updateDashboard();
      saveStateToLocalStorage();
      alert(`Gift set created: ${flavor1} & ${flavor2} for R200`);
    }

 // Generate PDF report
function generatePdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const marketName = document.getElementById("marketName").value;
  const marketDate = document.getElementById("marketDate").value;
  const marketSP = document.getElementById("marketSP").value;

  // Calculate total sales
  const totalSales = salesLog.reduce((sum, sale) => sum + sale.total_price, 0);
  const cardSales = totalSales - cashSales;

  // Get total bottles (make sure the element exists and has a valid value)
  const totalBottles = document.getElementById("totalBottles") ? parseInt(document.getElementById("totalBottles").textContent) : 0;

  // Create a new report object with the necessary data
  const currentReport = {
    marketName,
    marketSP,
    marketDate,
    totalSales,
    cardSales,
    totalBottles, // Ensure totalBottles is part of the report
  };

  // Retrieve and manage market history from localStorage
  let marketHistory = JSON.parse(localStorage.getItem("marketHistory")) || [];
  if (marketHistory.length >= 10) {
    marketHistory.shift(); // Remove the oldest report if there are 10 or more
  }
  marketHistory.push(currentReport); // Add the new report
  localStorage.setItem("marketHistory", JSON.stringify(marketHistory));

  // PDF Generation
  doc.setFontSize(22);
  doc.text("Sauce Inventory Summary", 10, 20);
  doc.setFontSize(14);
  doc.text(`Market Name: ${marketName || "N/A"}`, 10, 30);
  doc.text(`Salesperson: ${marketSP || "N/A"}`, 10, 40);
  doc.text(`Date: ${marketDate || "N/A"}`, 10, 50);

  doc.setFontSize(16);
  doc.text("Sales Summary", 10, 60);
  doc.setFontSize(12);
  doc.text(`Total Bottles Sold: ${totalBottles}`, 10, 70);  // Ensure totalBottles is correctly displayed
  doc.text(`Two-Bottle Promotions Sold: ${twoBottlePromotionsSold}`, 10, 110);
  doc.text(`Gift Sets Sold: ${giftSetsSold}`, 10, 120);
  doc.text(`Cash Sales: R${cashSales}`, 10, 90);
  doc.text(`Card Sales: R${cardSales}`, 10, 100); 
  doc.text(`Total Sales Amount: R${totalSales}`, 10, 80);

  doc.setFontSize(16);
  doc.text("Current Inventory", 10, 140);
  doc.setFontSize(12);
  let yPosition = 150;
  Object.entries(inventory).forEach(([flavor, data]) => {
    if (yPosition > 270) {  // Check if we're near the bottom of the page
      doc.addPage();  // Add a new page
      yPosition = 10; // Reset Y position
    }
    doc.text(`${flavor}: ${data.stock} bottles`, 10, yPosition);
    yPosition += 10;  // Move the Y position down for the next entry
  });

  doc.save("sauce_inventory_summary.pdf");
}

    
    function voidLastTransaction() {
      if (salesLog.length === 0) {
        alert("No transactions to void.");
        return;
      }
      const lastTransaction = salesLog.pop();
      const flavor = lastTransaction.flavor;
      if (lastTransaction.quantity === 1) {
        inventory[flavor].stock += 1;
      } else if (lastTransaction.quantity === 2) {
        const flavors = flavor.split(" & ");
        if (flavors.length === 2) {
          inventory[flavors[0]].stock += 1;
          inventory[flavors[1]].stock += 1;
        } else {
          inventory[flavor].stock += 2;
        }
      }
      updateDashboard();
      saveStateToLocalStorage();
      alert(`Voided last transaction: ${flavor} (${lastTransaction.quantity} bottles)`);
    }
    
    updateDashboard();