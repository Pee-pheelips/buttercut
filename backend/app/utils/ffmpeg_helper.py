import subprocess
from typing import List, Dict
from pathlib import Path

class FFmpegHelper:
    @staticmethod
    def build_filter_complex(overlays: List[dict], overlay_files: Dict[str, str]) -> tuple:
        """Build FFmpeg filter complex and inputs"""
        filter_complex = []
        inputs = []
        overlay_input_map = {}
        input_index = 1
        
        # Add overlay files as inputs
        for overlay in overlays:
            if overlay["type"] in ["image", "video"] and overlay["content"] in overlay_files:
                inputs.extend(["-i", overlay_files[overlay["content"]]])
                overlay_input_map[overlay["id"]] = input_index
                input_index += 1
        
        current_stream = "[0:v]"
        
        for i, overlay in enumerate(overlays):
            overlay_type = overlay["type"]
            start_time = overlay["start_time"]
            end_time = overlay["end_time"]
            x = int((overlay["x"] / 100) * 1920)
            y = int((overlay["y"] / 100) * 1080)
            
            if overlay_type == "text":
                text = overlay["content"].replace("'", "\\'").replace(":", "\\:")
                fontsize = overlay.get("fontSize", 24)
                fontcolor = overlay.get("color", "white")
                
                text_filter = (
                    f"drawtext=text='{text}':fontsize={fontsize}:fontcolor={fontcolor}:"
                    f"x={x}:y={y}:enable='between(t,{start_time},{end_time})'"
                )
                filter_complex.append(f"{current_stream}{text_filter}[v{i}]")
                current_stream = f"[v{i}]"
                
            elif overlay_type == "image" and overlay["id"] in overlay_input_map:
                input_idx = overlay_input_map[overlay["id"]]
                width = overlay.get("width", 150)
                height = overlay.get("height", 100)
                
                scale_filter = f"[{input_idx}:v]scale={width}:{height}[scaled{i}]"
                overlay_filter = (
                    f"{current_stream}[scaled{i}]overlay={x}:{y}:"
                    f"enable='between(t,{start_time},{end_time})'[v{i}]"
                )
                filter_complex.append(scale_filter)
                filter_complex.append(overlay_filter)
                current_stream = f"[v{i}]"
                
            elif overlay_type == "video" and overlay["id"] in overlay_input_map:
                input_idx = overlay_input_map[overlay["id"]]
                width = overlay.get("width", 150)
                height = overlay.get("height", 100)
                
                trim_filter = f"[{input_idx}:v]trim=0:{end_time - start_time},setpts=PTS-STARTPTS[trimmed{i}]"
                scale_filter = f"[trimmed{i}]scale={width}:{height}[scaled{i}]"
                overlay_filter = (
                    f"{current_stream}[scaled{i}]overlay={x}:{y}:"
                    f"enable='between(t,{start_time},{end_time})'[v{i}]"
                )
                filter_complex.append(trim_filter)
                filter_complex.append(scale_filter)
                filter_complex.append(overlay_filter)
                current_stream = f"[v{i}]"
        
        return inputs, filter_complex, current_stream
    
    @staticmethod
    def process_video(video_path: str, output_path: str, overlays: List[dict], 
                     overlay_files: Dict[str, str]) -> tuple[bool, str]:
        """Process video with FFmpeg"""
        try:
            inputs, filter_complex, current_stream = FFmpegHelper.build_filter_complex(
                overlays, overlay_files
            )
            
            cmd = ["ffmpeg", "-y", "-i", video_path] + inputs
            
            if filter_complex:
                cmd.extend(["-filter_complex", ";".join(filter_complex)])
                cmd.extend(["-map", current_stream])
            else:
                cmd.extend(["-c", "copy"])
            
            cmd.extend(["-map", "0:a?", "-c:a", "copy", output_path])
            
            print(f"Running FFmpeg command: {' '.join(cmd)}")
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                return False, result.stderr
            
            return True, "Success"
            
        except Exception as e:
            return False, str(e)