// Function to hide AppKit balance display
export function hideAppKitBalance() {
  const hideBalance = () => {
    // Target AppKit button elements
    const appkitButtons = document.querySelectorAll('appkit-button, w3m-account-button');
    
    appkitButtons.forEach(button => {
      // Hide shadow DOM content
      if (button.shadowRoot) {
        const balanceElements = button.shadowRoot.querySelectorAll(
          '[data-testid*="balance"], .balance, [class*="balance"], span:first-child'
        );
        balanceElements.forEach(el => {
          el.style.display = 'none';
          el.style.visibility = 'hidden';
        });
        
        // Hide first text node which usually contains balance
        const textNodes = Array.from(button.shadowRoot.querySelectorAll('*')).filter(
          node => node.childNodes.length > 0 && node.childNodes[0].nodeType === Node.TEXT_NODE
        );
        textNodes.forEach(node => {
          if (node.textContent.includes('ETH') || node.textContent.includes('0.0')) {
            node.style.display = 'none';
            node.style.visibility = 'hidden';
          }
        });
      }
      
      // Also hide in regular DOM
      const balanceElements = button.querySelectorAll(
        '[data-testid*="balance"], .balance, [class*="balance"], span:first-child'
      );
      balanceElements.forEach(el => {
        el.style.display = 'none';
        el.style.visibility = 'hidden';
      });
    });
  };

  // Run immediately
  hideBalance();
  
  // Run after DOM changes
  const observer = new MutationObserver(hideBalance);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true
  });
  
  // Run periodically as fallback
  setInterval(hideBalance, 1000);
}