// PurchaseFMS.jsx
import React from 'react';

const PurchaseFMS = ({ selectedPage }) => {
  // You can add module-specific logic or components here
  if (!['purchase-orders', 'vendor-management', 'inventory-tracking', 'procurement-reports'].includes(selectedPage)) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-4">Purchase FMS Module Content</h3>
      <p>This is additional content for the Purchase FMS module. Customize as needed for {selectedPage}.</p>
      {/* Add more components or features specific to Purchase FMS */}
    </div>
  );
};

export default PurchaseFMS;