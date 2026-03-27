import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export type VNProvince = { code: number; name: string };
export type VNDistrict = { code: number; name: string };
export type VNWard = { code: number; name: string };

export function useVietnamAddress() {
  const [provinces, setProvinces] = useState<VNProvince[]>([]);
  const [districts, setDistricts] = useState<VNDistrict[]>([]);
  const [wards, setWards] = useState<VNWard[]>([]);

  const [provinceCode, setProvinceCode] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [detailAddress, setDetailAddress] = useState("");

  const [loadingProvinceData, setLoadingProvinceData] = useState(false);
  const [loadingDistrictData, setLoadingDistrictData] = useState(false);
  const [loadingWardData, setLoadingWardData] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        setLoadingProvinceData(true);
        const res = await axios.get<VNProvince[]>(
          "https://provinces.open-api.vn/api/p/",
        );
        setProvinces(res.data ?? []);
      } catch {
        toast.error("Không tải được danh sách tỉnh/thành");
      } finally {
        setLoadingProvinceData(false);
      }
    };

    void run();
  }, []);

  useEffect(() => {
    if (!provinceCode) {
      setDistricts([]);
      setDistrictCode("");
      setWards([]);
      setWardCode("");
      return;
    }

    const run = async () => {
      try {
        setLoadingDistrictData(true);
        const res = await axios.get<{ districts: VNDistrict[] }>(
          `https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`,
        );
        setDistricts(res.data?.districts ?? []);
      } catch {
        toast.error("Không tải được danh sách quận/huyện");
        setDistricts([]);
      } finally {
        setLoadingDistrictData(false);
        setDistrictCode("");
        setWards([]);
        setWardCode("");
      }
    };

    void run();
  }, [provinceCode]);

  useEffect(() => {
    if (!districtCode) {
      setWards([]);
      setWardCode("");
      return;
    }

    const run = async () => {
      try {
        setLoadingWardData(true);
        const res = await axios.get<{ wards: VNWard[] }>(
          `https://provinces.open-api.vn/api/d/${districtCode}?depth=2`,
        );
        setWards(res.data?.wards ?? []);
      } catch {
        toast.error("Không tải được danh sách phường/xã");
        setWards([]);
      } finally {
        setLoadingWardData(false);
        setWardCode("");
      }
    };

    void run();
  }, [districtCode]);

  const selectedProvinceName = useMemo(
    () => provinces.find((p) => String(p.code) === provinceCode)?.name ?? "",
    [provinces, provinceCode],
  );

  const selectedDistrictName = useMemo(
    () => districts.find((d) => String(d.code) === districtCode)?.name ?? "",
    [districts, districtCode],
  );

  const selectedWardName = useMemo(
    () => wards.find((w) => String(w.code) === wardCode)?.name ?? "",
    [wards, wardCode],
  );

  const fullAddress = useMemo(() => {
    const parts = [
      detailAddress.trim(),
      selectedWardName,
      selectedDistrictName,
      selectedProvinceName,
    ].filter(Boolean);

    return parts.join(", ");
  }, [
    detailAddress,
    selectedWardName,
    selectedDistrictName,
    selectedProvinceName,
  ]);

  const resetAddressForm = () => {
    setProvinceCode("");
    setDistrictCode("");
    setWardCode("");
    setDetailAddress("");
  };

  return {
    provinces,
    districts,
    wards,
    provinceCode,
    districtCode,
    wardCode,
    detailAddress,
    loadingProvinceData,
    loadingDistrictData,
    loadingWardData,
    selectedProvinceName,
    selectedDistrictName,
    selectedWardName,
    fullAddress,
    setProvinceCode,
    setDistrictCode,
    setWardCode,
    setDetailAddress,
    resetAddressForm,
  };
}