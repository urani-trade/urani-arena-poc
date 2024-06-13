'use client';

import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import {BatchOrderList} from "@/components/batch/batch-order-list";
import {SolutionsList} from "@/components/solutions/solutions-list";
import {IBatch} from "@/types";
import {debounce} from "@/utils/utils";

const TIME_AUTO_CHANGE: number = 4000; // 4000 for develop and testing ( 40000 for prod)

interface Props {
    batch: IBatch;
    selectedSolutionId: string;
    handleSelectSolution: (id: string) => void;
    handleChangeBatchId: (id: string) => void;
}

const OrderBatch:FC<Props> = ({
  batch,
  handleSelectSolution,
  selectedSolutionId,
  handleChangeBatchId
}) => {

    const [isRunning, setIsRunning] = useState<boolean>(false);

    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(0);
    const remainingTimeRef = useRef<number>(TIME_AUTO_CHANGE);

    const [inputValueId, setInputValueId] = useState<string>(batch?.batchId.toString());

    useEffect(() => {
        if(batch?.batchId){
            setInputValueId(batch?.batchId.toString());
        }
    }, [batch]);

    useEffect(() => {
        if (!isRunning || !batch) return;

        startTimeRef.current = Date.now();
        timerRef.current = setTimeout(() => {
            const nextBatchId = (batch.batchId + 1).toString();
            handleChangeBatchId(nextBatchId);
            remainingTimeRef.current = TIME_AUTO_CHANGE;
        }, remainingTimeRef.current);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current as NodeJS.Timeout);
            }
        };
    }, [isRunning,batch, handleChangeBatchId]);

    useEffect(() => {
        if (batch) {
            startTimer();
        }
    }, [batch]);

    const startTimer = () => {
        if (!isRunning) {
            setIsRunning(true);
        }
    };

    const pauseTimer = () => {
        if (isRunning) {
            setIsRunning(false);
            if (timerRef.current) {
                clearTimeout(timerRef.current as NodeJS.Timeout);
            }
            const timePassed = Date.now() - (Date.now() - remainingTimeRef.current);
            remainingTimeRef.current -= timePassed;
        }
    };

    const resetTimer = () => {
        setIsRunning(false);
        remainingTimeRef.current = TIME_AUTO_CHANGE;
        if (timerRef.current) {
            clearTimeout(timerRef.current as NodeJS.Timeout);
        }
    };

    const prevBatch = () => {
        if (batch && batch.batchId > 1) {
            const prevBatchId = (batch.batchId - 1).toString();
            handleChangeBatchId(prevBatchId);
        }
    };

    const nextBatch = () => {
        if (batch) {
            const nextBatchId = (batch.batchId + 1).toString();
            handleChangeBatchId(nextBatchId);
        }
    };

    const debouncedHandleChangeBatchId = useRef(debounce(handleChangeBatchId, 600)).current;


    const changeCurrentBatch = useCallback((value: string) => {
        const sanitizedValue = value.replace(/[^0-9]/g, '');
        setInputValueId(sanitizedValue);
        if (sanitizedValue) {
            debouncedHandleChangeBatchId(sanitizedValue);
        }
    }, [debouncedHandleChangeBatchId]);

    return (
        <div>
            <div className="container flex justify-between items-center bg-transparent mb-4 m-auto">
                <button
                    className={`w-10 h-10 flex items-center justify-center rounded-full border-2 border-white text-white transition duration-200
                          ${batch && batch.batchId === 1 ? 'bg-brandDisabled text-arrowDisabled border-brandBorderDisabled cursor-not-allowed' : 'hover:bg-brand hover:text-white'}`}
                    onClick={prevBatch}
                    disabled={batch && batch.batchId === 1}
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 19l-7-7 7-7"
                        ></path>
                    </svg>
                </button>
                <div className="flex">
                    <h2 className="font-semibold text-white text-center mr-3">Batch #</h2>
                    <input style={{ width: '137px' }}
                        className="bg-transparent border-2 border-secondBrand rounded-md text-white text-center"
                        value={inputValueId}
                        onChange={(event) => changeCurrentBatch(event.target.value)}
                    />
                </div>
                <button
                    className={`w-10 h-10 flex items-center justify-center rounded-full border-2 border-white text-white transition duration-200
                        hover:bg-brand hover:text-white`}
                    onClick={nextBatch}
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 5l7 7-7 7"
                        ></path>
                    </svg>
                </button>
            </div>
            {
                batch &&
                <>
                    <div className="container rounded-lg mb-4">
                        <button
                            className="container flex justify-center px-4 py-2 rounded-md text-backgroundPage transition-colors duration-200 ease-in-out
                        bg-white hover:bg-hoverWhite active:bg-hoverWhite focus:outline-none focus:ring-2 focus:ring-blue-300"
                            onClick={() => isRunning ? pauseTimer() : startTimer() }
                        >
                            {isRunning ?
                                <div className="flex">
                                    <img  src="/pause.svg" className="mr-2" alt="" />
                                    Pause
                                </div>
                                :
                                <div className="flex">
                                    <img  src="/livestream.svg" className="mr-2" alt="" />
                                    Livestream
                                </div>
                            }
                        </button>
                    </div>
                    <div className="bg-brand p-4 rounded-lg shadow-lg w-96 mb-4">
                        <div className="font-semibold text-white mb-4 text-left">Orders</div>
                        <BatchOrderList currentBatch={batch}/>
                    </div>

                    <div className="bg-brand p-4 rounded-lg shadow-lg w-96">
                        <div className="font-semibold text-white mb-2 text-left">Solutions</div>
                        <SolutionsList
                            currentBatch={batch}
                            selectedSolutionId={selectedSolutionId}
                            handleSelectSolution={handleSelectSolution}
                        />
                    </div>
                </>
            }
        </div>
    );
};

export default OrderBatch;
