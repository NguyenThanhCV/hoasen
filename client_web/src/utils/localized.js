export const localized = (record, field, language) => {
  const english = String(language || "").toLowerCase().startsWith("en");
  const preferred = english ? record?.[`${field}En`] : record?.[field];
  const fallback = english ? record?.[field] : record?.[`${field}En`];
  return preferred || fallback || "";
};

export const localizedAttribute = (product, name, value, language) => {
  const english = String(language || "").toLowerCase().startsWith("en");
  const row = (product?.attributeTranslations || []).find((item) => item.name === name);
  const translatedValue = row?.values?.find((item) => String(item.value) === String(value));
  return {
    name: (english ? row?.nameEn : row?.name) || (english ? row?.name : row?.nameEn) || name,
    value: (english ? translatedValue?.valueEn : translatedValue?.value) || (english ? translatedValue?.value : translatedValue?.valueEn) || value,
  };
};
