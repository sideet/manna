import { PrismaService } from 'src/lib/database/prisma.service';
import { ScheduleService } from './schedule.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import {
  ParticipationTimesRepository,
  RegionDetailRepository,
  RegionRepository,
  ScheduleParticipantsRepository,
  ScheduleUnitsRepository,
  SchedulesRepository,
} from 'src/lib/database/repositories';
import { CommonUtil, DateUtil } from 'src/lib/common/utils';
import {
  MeetingType,
  ScheduleType,
  TimeUnit,
} from 'src/lib/common/enums/schedule.enum';

describe('ScheduleService', () => {
  const dateUtil = new DateUtil();
  let service: ScheduleService;
  let commonUtil: DeepMockProxy<CommonUtil>;
  let prisma: DeepMockProxy<PrismaService>;
  let schedulesRepository: DeepMockProxy<SchedulesRepository>;
  let scheduleUnitsRepository: ScheduleUnitsRepository;
  let scheduleParticipantsRepository: ScheduleParticipantsRepository;
  let participationTimesRepository: ParticipationTimesRepository;
  let regionDetailRepository: DeepMockProxy<RegionDetailRepository>;
  let regionRepository: DeepMockProxy<RegionRepository>;

  const baseSchedule = {
    user_no: 1,
    name: '일정생성',
    description: '',
    type: ScheduleType.COMMON,
    meeting_type: MeetingType.OFFLINE,
    detail_address: '',
    is_participant_visible: true,
    is_duplicate_participation: true,
    start_date: '2025-12-01',
    end_date: '2025-12-09',
    start_time: '11:00:00',
    end_time: '19:00:00',
    time_unit: TimeUnit.HOUR,
    time: 1,
    region_no: 1,
    region_detail_no: 1,
    expiry_time: 24,
    blocked_date: [],
  };

  beforeEach(async () => {
    commonUtil = mockDeep<CommonUtil>();

    prisma = mockDeep<PrismaService>();
    schedulesRepository = mockDeep<SchedulesRepository>();
    scheduleUnitsRepository = mockDeep<ScheduleUnitsRepository>();
    scheduleParticipantsRepository = mockDeep<ScheduleParticipantsRepository>();
    participationTimesRepository = mockDeep<ParticipationTimesRepository>();
    regionDetailRepository = mockDeep<RegionDetailRepository>();
    regionRepository = mockDeep<RegionRepository>();

    service = new ScheduleService(
      commonUtil,
      dateUtil,
      prisma,
      schedulesRepository,
      scheduleUnitsRepository,
      scheduleParticipantsRepository,
      participationTimesRepository,
      regionDetailRepository,
      regionRepository
    );

    // 모든 테스트에서 트랜잭션은 항상 작동
    prisma.$transaction.mockImplementation(async (cb) => cb({}));
  });

  // ==================================================================
  // createSchedule
  // ==================================================================

  describe('createSchedule', () => {
    beforeEach(() => {
      // 지역 조회
      regionRepository.get.mockResolvedValue({ no: 1, name: '서울' });
      regionDetailRepository.get.mockResolvedValue({
        no: 1,
        region_no: 1,
        name: '강남구',
      });

      // 일정 생성
      schedulesRepository.create.mockResolvedValue({
        ...baseSchedule,
        no: 1,
        enabled: false,
        code: '',
        expiry_datetime: new Date('2025-12-31'),
        create_datetime: new Date('2025-11-01'),
        update_datetime: null,
        delete_datetime: null,
      });
    });

    describe('지역 검증', () => {
      it('region이 존재하지 않으면 예외 발생', async () => {
        regionRepository.get.mockResolvedValueOnce(null);
        await expect(service.createSchedule(baseSchedule)).rejects.toThrow(
          '지역정보를 확인해 주세요.'
        );
      });

      it('region_detail의 지역번호 불일치 시 예외 발생', async () => {
        regionRepository.get.mockResolvedValueOnce({ no: 1, name: '서울' });

        regionDetailRepository.get.mockResolvedValueOnce({
          no: 1,
          region_no: 2,
          name: '수원시 팔달구',
        });
        await expect(
          service.createSchedule({
            ...baseSchedule,
            region_no: 1,
            region_detail_no: 1,
          })
        ).rejects.toThrow('지역정보를 확인해 주세요.');
      });
    });

    describe('날짜, 시간 검증', () => {
      it('일정 기간은 5개월이내만 허용', async () => {
        await expect(
          service.createSchedule({
            ...baseSchedule,
            time_unit: TimeUnit.DAY,
            start_date: '2025-10-01',
            end_date: '2026-05-01',
          })
        ).rejects.toThrow('일정은 5개월이내로만 설정가능합니다.');
      });

      it('time_unit이 HOUR 경우 start_time, end_time값 필수', async () => {
        await expect(
          service.createSchedule({
            ...baseSchedule,
            time_unit: TimeUnit.HOUR,
            start_time: null,
            end_time: null,
          })
        ).rejects.toThrow('시작 시간, 종료 시간을 선택해주세요.');
      });

      it('time_unit이 MINUTE 경우 start_time, end_time값 필수', async () => {
        await expect(
          service.createSchedule({
            ...baseSchedule,
            time_unit: TimeUnit.MINUTE,
            start_time: null,
            end_time: null,
          })
        ).rejects.toThrow('시작 시간, 종료 시간을 선택해주세요.');
      });

      it('time_unit이 HOUR인 경우 time 값 필수', async () => {
        await expect(
          service.createSchedule({
            ...baseSchedule,
            time_unit: TimeUnit.HOUR,
            time: null,
          })
        ).rejects.toThrow('시간 간격을 선택해주세요.');
      });
    });

    describe('코드 검증', () => {
      beforeEach(() => {
        // 코드 생성 중복 시나리오
        schedulesRepository.get
          .mockResolvedValueOnce({
            ...baseSchedule,
            no: 1,
            enabled: true,
            code: 'Q12345',
            expiry_datetime: new Date('2025-12-31'),
            create_datetime: new Date('2025-11-01'),
            update_datetime: null,
            delete_datetime: null,
          }) // 첫 번째 중복
          .mockResolvedValueOnce(null); // 두 번째 통과

        commonUtil.generateBase62Code
          .mockReturnValueOnce('Q12345')
          .mockReturnValueOnce('B12345');
      });

      it('중복 코드 발생 시 새 코드로 재생성 및 일정 코드 업데이트', async () => {
        await service.createSchedule({ ...baseSchedule });

        expect(commonUtil.generateBase62Code).toHaveBeenCalledTimes(2);

        expect(schedulesRepository.update).toHaveBeenCalledWith(
          expect.objectContaining({
            data: { code: 'B12345' },
          }),
          expect.anything()
        );
      });
    });
  });

  // ==================================================================
  // getSchedules
  // ==================================================================
  describe('getSchedules', () => {
    const mockSchedules = [
      {
        no: 2,
        name: '백엔드 면접',
        description: '면접 일정 정하기',
        type: 'INDIVIDUAL',
        meeting_type: 'OFFLINE',
        detail_address: '강남역',
        is_participant_visible: false,
        is_duplicate_participation: true,
        start_date: '2025-10-23',
        end_date: '2025-10-31',
        start_time: '10:00:00',
        end_time: '16:00:00',
        time_unit: 'HOUR',
        time: 1,
        enabled: true,
        code: 'Q1234',
        expiry_datetime: '2025-10-23 11:13:34',
        create_datetime: '2025-10-22 11:13:34',
        update_datetime: '2025-10-22 11:13:34',
        delete_datetime: null,
        user_no: 1,
        region_no: 1,
        region_detail_no: 1,
        region: {
          no: 1,
          name: '서울',
        },
        region_detail: {
          no: 1,
          name: '강남구',
        },
        _count: { schedule_participants: 5 },
      },
      {
        no: 4,
        name: '저녁 약속',
        description: '저녁 일정 정하기',
        type: 'COMMON',
        meeting_type: 'OFFLINE',
        detail_address: '강남역',
        is_participant_visible: false,
        is_duplicate_participation: true,
        start_date: '2025-10-23',
        end_date: '2025-10-31',
        start_time: '18:00:00',
        end_time: '20:00:00',
        time_unit: 'HOUR',
        time: 1,
        enabled: true,
        code: 'B1234',
        expiry_datetime: '2025-10-23 11:17:15',
        create_datetime: '2025-10-22 11:17:15',
        update_datetime: '2025-10-22 11:17:15',
        delete_datetime: null,
        user_no: 1,
        region_no: 1,
        region_detail_no: 1,
        region: {
          no: 1,
          name: '서울',
        },
        region_detail: {
          no: 1,
          name: '강남구',
        },
        _count: { schedule_participants: 0 },
      },
    ];

    it('일정 목록 조회', async () => {
      schedulesRepository.gets.mockResolvedValue([]);
      await service.getSchedules({ user_no: 1 });

      expect(schedulesRepository.gets).toHaveBeenCalledWith({
        where: { user_no: 1, enabled: true },
        include: {
          _count: {
            select: {
              schedule_participants: true,
            },
          },
          region: {
            select: { no: true, name: true },
          },
          region_detail: {
            select: { no: true, name: true },
          },
        },
      });
    });

    it('일정 참여자 수 매핑 작업', async () => {
      schedulesRepository.gets.mockResolvedValue(mockSchedules as any);

      const result = await service.getSchedules({ user_no: 1 });

      expect(result.schedules).toEqual([
        expect.objectContaining({
          participant_count: 5,
        }),
        expect.objectContaining({
          participant_count: 0,
        }),
      ]);
    });
  });
});
