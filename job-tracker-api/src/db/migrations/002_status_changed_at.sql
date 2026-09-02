ALTER TABLE "Jobs" add COLUMN status_changed_at TIMESTAMP;

-- backfill with applied date
UPDATE "Jobs" SET status_changed_at = COALESCE(applied_at, created_at);

--now apply not null + default value 

ALTER TABLE "Jobs"
    ALTER COLUMN status_changed_at SET NOT NULL,
    ALTER COLUMN status_changed_at SET DEFAULT now();

-- what action should be triggered ? UPDATE 
-- when? when job's status changed 
-- job's status should be watching 

CREATE FUNCTION update_status_changed() RETURNS TRIGGER
AS $$ -- 함수 본문이 시작된다는 뜻 ($$ 는 그 본문 문자열을 감싸는 구분자)
BEGIN
  -- 변경되는 데이터(NEW)의 updated_at 컬럼을 현재 시간으로 설정
    NEW.status_changed_at = now();
    -- 변경된 최종 데이터를 테이블에 반영하라는 의미로 NEW를 리턴
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_status_change 
BEFORE UPDATE OF status ON "Jobs" 
FOR EACH ROW  
-- the trigger runs independently for every individual row that is modified 
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_status_changed();