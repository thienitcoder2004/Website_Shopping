exports.getDisplayPrice = (product, variant) => {
    if (variant && Number(variant.price) > 0) return Number(variant.price);
    if (Number(product.salePrice) > 0) return Number(product.salePrice);
    return Number(product.basePrice);
};

exports.getOldPrice = (product, variant) => {
    // giá gạch (old price) – thường là basePrice nếu đang sale
    if (variant && Number(variant.price) > 0) return 0; // tuỳ bạn, có thể lưu oldPrice theo variant nếu muốn
    if (Number(product.salePrice) > 0) return Number(product.basePrice);
    return 0;
};
