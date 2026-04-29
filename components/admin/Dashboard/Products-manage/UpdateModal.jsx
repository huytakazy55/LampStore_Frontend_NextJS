"use client";

import React, { useContext, useState, useEffect } from 'react'
import { Modal, Form, Input, Select, InputNumber, Checkbox, Button, Space, Typography, Divider } from 'antd';
import { EditOutlined, SaveOutlined, CloseOutlined, CameraOutlined, LinkOutlined } from '@ant-design/icons';
import ProductManage from '@/services/ProductManage';
import TagManage from '@/services/TagManage';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '@/contexts/ThemeContext';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const { Title } = Typography;

const UpdateModal = ({ openUpdate, handleUpdateClose, fetchProducts, style, categories, product }) => {
  const { themeColors } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [tags, setTags] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  //Thêm phân loại
  const [productTypes, setProductTypes] = useState([{ typeName: '', options: [{ value: '', additionalPrice: 0, imageUrl: '' }] }]);

  const handleAddProductType = () => {
    setProductTypes([...productTypes, { typeName: '', options: [{ value: '', additionalPrice: 0, imageUrl: '' }] }]);
  };

  const handleTypeChange = (index, value) => {
    const updatedTypes = [...productTypes];
    updatedTypes[index].typeName = value;
    setProductTypes(updatedTypes);
  };

  const handleOptionChangeByType = (typeIndex, optionIndex, field, val) => {
    const updatedTypes = [...productTypes];
    updatedTypes[typeIndex].options[optionIndex] = {
      ...updatedTypes[typeIndex].options[optionIndex],
      [field]: field === 'additionalPrice' ? (parseFloat(val) || 0) : val
    };

    if (field === 'value' && val && optionIndex === updatedTypes[typeIndex].options.length - 1) {
      updatedTypes[typeIndex].options.push({ value: '', additionalPrice: 0, imageUrl: '' });
    }
    setProductTypes(updatedTypes);
  };

  const handleOptionImageUpload = async (typeIndex, optionIndex, file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT;
      const res = await fetch(`${API_ENDPOINT}/api/Products/UploadVariantImage`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      const imgPath = data?.imageUrl;
      if (imgPath) {
        const updatedTypes = [...productTypes];
        updatedTypes[typeIndex].options[optionIndex].imageUrl = imgPath;
        setProductTypes(updatedTypes);
        toast.success('Tải ảnh tùy chọn thành công!');
      }
    } catch {
      toast.error('Lỗi khi tải ảnh tùy chọn');
    }
  };

  const handleRemoveOptionByType = (typeIndex, optionIndex) => {
    const updatedTypes = [...productTypes];
    updatedTypes[typeIndex].options = updatedTypes[typeIndex].options.filter((_, i) => i !== optionIndex);
    setProductTypes(updatedTypes);
  };

  const handleRemoveProductType = (index) => {
    const updatedTypes = productTypes.filter((_, i) => i !== index);
    setProductTypes(updatedTypes);
  };

  const [updateData, setUpdateData] = useState({
    id: '',
    name: '',
    description: '',
    categoryId: '',
    tags: '',
    rating: '',
    viewcount: '',
    reviewcount: '',
    favorites: '',
    dateAdded: '',
    status: ''
  });

  const [variantData, setVariantData] = useState({
    price: 0,
    discountPrice: 0,
    stock: 0,
    materials: '',
    weight: 0,
    sku: ''
  });

  const handleSubmitUpdate = async (values) => {
    if (!values.name || !values.price || !values.stock) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    try {
      const variantTypes = productTypes
        .filter(type => type.typeName.trim() !== "" && type.options.some(opt => opt.value.trim() !== ""))
        .map(type => ({
          name: type.typeName,
          values: type.options
            .filter(opt => opt.value.trim() !== "")
            .map(opt => ({ value: opt.value, additionalPrice: opt.additionalPrice || 0, imageUrl: opt.imageUrl || null }))
        }));

      const updatedProduct = {
        id: updateData.id,
        name: values.name,
        description: values.description,
        categoryId: values.categoryId,
        tags: values.tags ? values.tags.join(',') : '',
        reviewCount: values.reviewCount,
        viewCount: values.viewCount,
        favorites: values.favorites,
        sellCount: values.sellCount,
        dateAdded: values.dateAdded,
        status: values.status,
        addOnProductIds: values.addOnProductIds || [],
        productVariant: {
          price: values.price,
          discountPrice: values.discountPrice,
          stock: values.stock,
          materials: values.materials,
          weight: values.weight,
          sku: values.sku
        },
        variantTypes: variantTypes
      };

      await ProductManage.UpdateProduct(updatedProduct)
        .then(async (res) => {
          fetchProducts();
          toast.success("Cập nhật bản ghi thành công");
          handleUpdateClose();
        })
        .catch((err) => {
          toast.error("Có lỗi xảy ra.");
        });
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm:", error);
      toast.error("Có lỗi xảy ra khi cập nhật sản phẩm!");
    }
  };

  useEffect(() => {
    if (product) {
      const fetchData = async () => {
        try {
          const productRes = await ProductManage.GetProductById(product.id);

          const productData = productRes?.data;
          // Extract variant from the product response (singular)
          const variant = productData?.variant;

          const formData = {
            id: productData?.id,
            name: productData?.name,
            description: productData?.description,
            categoryId: productData?.categoryId,
            tags: productData?.tags ? productData?.tags.split(',') : [],
            rating: productData?.rating,
            viewCount: productData?.viewCount,
            reviewCount: productData?.reviewCount,
            favorites: productData?.favorites,
            sellCount: productData?.sellCount,
            dateAdded: productData?.dateAdded,
            status: productData?.status,
            addOnProductIds: (productData?.addOnProducts?.$values || productData?.addOnProducts || []).map(a => a.id),
            price: variant?.price,
            discountPrice: variant?.discountPrice,
            stock: variant?.stock,
            materials: variant?.materials,
            weight: variant?.weight,
            sku: variant?.sku
          };

          // Reset form trước khi set giá trị mới
          form.resetFields();
          form.setFieldsValue(formData);
          setUpdateData(formData);
          setVariantData({
            price: variant?.price,
            discountPrice: variant?.discountPrice,
            stock: variant?.stock,
            materials: variant?.materials,
            weight: variant?.weight,
            sku: variant?.sku
          });

          // Extract variant types from product response (no extra API calls needed)
          const variantTypesRaw = productData?.variantTypes?.$values || productData?.variantTypes || [];
          const variantTypesArr = Array.isArray(variantTypesRaw) ? variantTypesRaw : [];

          if (variantTypesArr.length > 0) {
            const mappedTypes = variantTypesArr.map(type => {
              const valuesRaw = type.values?.$values || type.values || [];
              const valuesArr = Array.isArray(valuesRaw) ? valuesRaw : [];
              return {
                typeName: type.name,
                options: valuesArr.length > 0
                  ? [...valuesArr.map(v => ({ value: v.value || (typeof v === 'string' ? v : ''), additionalPrice: v.additionalPrice || 0, imageUrl: v.imageUrl || '' })), { value: '', additionalPrice: 0, imageUrl: '' }]
                  : [{ value: '', additionalPrice: 0, imageUrl: '' }]
              };
            });
            setProductTypes(mappedTypes);
          } else {
            setProductTypes([{ typeName: '', options: [{ value: '', additionalPrice: 0, imageUrl: '' }] }]);
          }
        } catch (error) {
          toast.error("Có lỗi khi lấy dữ liệu.");
          console.error(error);
        }
      };

      fetchData();
    }
  }, [product, form]);

  useEffect(() => {
    const currentDate = new Date().toISOString();
    form.setFieldValue('dateAdded', currentDate);
  }, [form]);

  useEffect(() => {
    TagManage.GetTag()
      .then((res) => {
        setTags(res.data.$values);
      })
      .catch((err) => {

      });

    ProductManage.GetProduct()
      .then((res) => {
        setAllProducts(res.data.$values || []);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // Thêm CSS cho modal
  useEffect(() => {
    const customStyles = `
            .custom-modal .ant-modal-content {
                border-radius: 8px;
                overflow: hidden;
            }

            .custom-modal .ant-modal-header {
                padding: 16px 24px;
                border-bottom: 2px solid #f0f0f0;
                margin-bottom: 0;
            }

            .custom-modal .ant-modal-body {
                padding: 24px;
            }

            .custom-modal .ant-modal-footer {
                padding: 16px 24px;
                border-top: 1px solid #f0f0f0;
            }

            .custom-form .ant-form-item-label {
                font-weight: 500;
            }

            .custom-form .ant-input,
            .custom-form .ant-input-number,
            .custom-form .ant-select-selector {
                border-radius: 4px;
            }

            .custom-form .ant-input:hover,
            .custom-form .ant-input-number:hover,
            .custom-form .ant-select-selector:hover {
                border-color: ${themeColors.StartColorLinear};
            }

            .custom-form .ant-input:focus,
            .custom-form .ant-input-number:focus,
            .custom-form .ant-select-selector:focus {
                border-color: ${themeColors.StartColorLinear};
                box-shadow: 0 0 0 2px ${themeColors.StartColorLinear}20;
            }
        `;

    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = customStyles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, [themeColors]);

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <EditOutlined style={{ color: themeColors.StartColorLinear, fontSize: '20px' }} />
          <Title level={4} style={{ margin: 0, color: themeColors.StartColorLinear }}>
            Cập nhật sản phẩm
          </Title>
        </div>
      }
      open={openUpdate}
      onCancel={handleUpdateClose}
      width={1200}
      footer={[
        <Button
          key="cancel"
          onClick={handleUpdateClose}
          icon={<CloseOutlined />}
          danger
        >
          Đóng
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => form.submit()}
          icon={<SaveOutlined />}
          style={{ background: themeColors.StartColorLinear }}
        >
          Lưu lại
        </Button>
      ]}
      className="custom-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmitUpdate}
        className="custom-form"
      >
        <Form.Item
          name="name"
          label="Tên sản phẩm"
          rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
        >
          <Input placeholder="Nhập tên sản phẩm" />
        </Form.Item>

        <div className="flex gap-4">
          <Form.Item
            name="categoryId"
            label="Danh mục sản phẩm"
            className="w-1/3"
            rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
          >
            <Select placeholder="Chọn danh mục">
              {categories.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá bán"
            className="w-1/3"
            rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="Nhập giá bán"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="stock"
            label="Số lượng"
            className="w-1/3"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="Nhập số lượng"
            />
          </Form.Item>
        </div>

        <div className="flex gap-4">
          <Form.Item
            name="discountPrice"
            label="Giá khuyến mãi"
            className="w-1/3"
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              placeholder="Nhập giá khuyến mãi"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="materials"
            label="Chất liệu"
            className="w-1/3"
          >
            <Input placeholder="Nhập chất liệu" />
          </Form.Item>

          <Form.Item
            name="weight"
            label="Cân nặng (kg)"
            className="w-1/3"
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              step={0.1}
              placeholder="Nhập cân nặng"
            />
          </Form.Item>
        </div>

        <div className="flex gap-4">
          <Form.Item
            name="sku"
            label="SKU"
            className="w-1/3"
          >
            <Input placeholder="Nhập mã SKU" />
          </Form.Item>

          <Form.Item
            name="tags"
            label="Tags"
            className="w-2/3"
          >
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="Chọn tags"
              options={tags.map(tag => ({
                label: tag.name,
                value: tag.id
              }))}
              allowClear
              showSearch
              optionFilterProp="label"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
        </div>

        <div className="mt-4 mb-4">
          {productTypes.map((type, typeIndex) => (
            <div key={typeIndex} className="mb-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex gap-4">
                <div className="w-1/3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-medium">Phân loại sản phẩm {typeIndex + 1}</div>
                    {productTypes.length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<CloseOutlined />}
                        onClick={() => handleRemoveProductType(typeIndex)}
                      />
                    )}
                  </div>
                  <Input
                    value={type.typeName}
                    placeholder="Tên phân loại"
                    onChange={(e) => handleTypeChange(typeIndex, e.target.value)}
                  />
                </div>
                <div className="w-2/3">
                  <div className="font-medium mb-2">Tùy chọn</div>
                  <div className="flex flex-wrap gap-2">
                    {type.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex gap-2 w-full items-center">
                        {option.imageUrl ? (
                          <div className="relative w-8 h-8 flex-shrink-0">
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_ENDPOINT}${option.imageUrl}`}
                              alt=""
                              className="w-8 h-8 rounded object-cover border border-gray-200"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updatedTypes = [...productTypes];
                                updatedTypes[typeIndex].options[optionIndex].imageUrl = '';
                                setProductTypes(updatedTypes);
                              }}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center cursor-pointer hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <label className="w-8 h-8 flex-shrink-0 border border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-blue-400 transition">
                            <CameraOutlined style={{ fontSize: 14, color: '#999' }} />
                            <input
                              type="file"
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                if (e.target.files?.[0]) handleOptionImageUpload(typeIndex, optionIndex, e.target.files[0]);
                              }}
                            />
                          </label>
                        )}
                        <Input
                          value={option.value}
                          placeholder={`Tùy chọn ${optionIndex + 1}`}
                          onChange={(e) => handleOptionChangeByType(typeIndex, optionIndex, 'value', e.target.value)}
                          style={{ flex: 2 }}
                        />
                        <Input
                          value={option.additionalPrice || ''}
                          placeholder="Giá thêm"
                          type="number"
                          min={0}
                          onChange={(e) => handleOptionChangeByType(typeIndex, optionIndex, 'additionalPrice', e.target.value)}
                          style={{ flex: 1 }}
                          prefix="₫"
                        />
                        {optionIndex !== type.options.length - 1 && (
                          <Button
                            type="text"
                            danger
                            icon={<CloseOutlined />}
                            onClick={() => handleRemoveOptionByType(typeIndex, optionIndex)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Button
            type="primary"
            onClick={handleAddProductType}
            icon={<SaveOutlined />}
            style={{ background: themeColors.StartColorLinear }}
          >
            Thêm phân loại
          </Button>
        </div>

        <Form.Item name="description" label="Mô tả">
          <ReactQuill theme="snow" placeholder="Nhập mô tả sản phẩm" />
        </Form.Item>

        <Divider orientation="left" style={{ color: themeColors.StartColorLinear }}>
          <LinkOutlined /> Sản phẩm phụ (Add-on)
        </Divider>

        <Form.Item
          name="addOnProductIds"
          label="Sản phẩm phụ đi kèm"
          tooltip="Chọn các sản phẩm sẽ được gợi ý mua kèm trên trang chi tiết"
        >
          <Select
            mode="multiple"
            placeholder="Chọn sản phẩm phụ (không bắt buộc)"
            allowClear
            showSearch
            optionFilterProp="label"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={allProducts
              .filter(p => p.id !== updateData?.id)
              .map(p => ({
                label: `${p.name} - ${p.minPrice?.toLocaleString('vi-VN')}₫`,
                value: p.id
              }))}
          />
        </Form.Item>

        <Form.Item name="status" valuePropName="checked">
          <Checkbox>Hoạt động</Checkbox>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default UpdateModal;