"use client";

import { useEffect, useState } from "react";
import { Region } from "@/types/region";
import { getRegions } from "@/app/api/region";
import styles from "./regionSelector.module.css";

interface RegionSelectorProps {
  onRegionChange: (
    regionNo: number | null,
    regionDetailNo: number | null
  ) => void;
  required?: boolean;
}

export default function RegionSelector({
  onRegionChange,
  required = false,
}: RegionSelectorProps) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionNo, setSelectedRegionNo] = useState<number | null>(null);
  const [selectedRegionDetailNo, setSelectedRegionDetailNo] = useState<
    number | null
  >(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoading(true);
        const response = await getRegions();
        setRegions(response.region);
      } catch (error) {
        console.error("지역 데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, []);

  const handleRegionChange = (regionNo: string) => {
    const regionNoNum = regionNo ? parseInt(regionNo) : null;
    setSelectedRegionNo(regionNoNum);
    setSelectedRegionDetailNo(null); // 지역이 변경되면 시군구 초기화
    onRegionChange(regionNoNum, null);
  };

  const handleRegionDetailChange = (regionDetailNo: string) => {
    const regionDetailNoNum = regionDetailNo ? parseInt(regionDetailNo) : null;
    setSelectedRegionDetailNo(regionDetailNoNum);
    onRegionChange(selectedRegionNo, regionDetailNoNum);
  };

  const selectedRegion = regions.find(
    (region) => region.no === selectedRegionNo
  );

  if (loading) {
    return (
      <div className={styles.regionSelector}>
        <label className={styles.label}>
          일정 위치{required && <span className={styles.required}>*</span>}
        </label>
        <div className={styles.loading}>지역 정보를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className={styles.regionSelector}>
      <label className={styles.label}>
        일정 위치{required && <span className={styles.required}>*</span>}
      </label>

      <div className={styles.selectGroup}>
        <select
          className={styles.select}
          value={selectedRegionNo || ""}
          onChange={(e) => handleRegionChange(e.target.value)}
          required={required}
        >
          <option value="">시/도를 선택하세요</option>
          {regions.map((region) => (
            <option key={region.no} value={region.no}>
              {region.name}
            </option>
          ))}
        </select>

        <select
          className={styles.select}
          value={selectedRegionDetailNo || ""}
          onChange={(e) => handleRegionDetailChange(e.target.value)}
          disabled={!selectedRegion}
          required={required}
        >
          <option value="">시/군/구를 선택하세요</option>
          {selectedRegion?.region_detail.map((detail) => (
            <option key={detail.no} value={detail.no}>
              {detail.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
