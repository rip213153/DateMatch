"use client";
import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function FindMatchParams() {
  return <FindMatchContent />;
}

function FindMatchContent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    seeking: "",
    university: "",
    email: "",
    interests: "",
    idealDate: "",


    personalityProfile: JSON.stringify({
      socialStyle: 7.5,
      emotionalReadiness: 8.5,
      dateStyle: 6.86,
      commitment: 10,
      communication: 8,
      independence: 8.6,
      career: 10.5,
      flexibility: 8.5,
    }),


    
  });
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const age = parseInt(formData.age);
    if (age < 18) {
      alert("你必须年满18岁才能使用此服务。");
      return;
    }

    try {
      const response = await fetch("/api/submit-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      await response.json();

      if (response.ok) {
        setShowConfirmation(true);
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        alert("提交失败，请重试。");
      }
    } catch (error) {
      console.error("Error submitting profile:", error);
      alert("提交失败，请检查网络连接。");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-red-100 to-purple-100 py-12 px-4">
      {/* Logo */}
      <motion.div
        className="absolute top-4 left-4 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Link href="/" className="flex items-center space-x-2">
          <Heart className="text-pink-500 h-6 w-6" />
          <span className="font-bold text-xl bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">
            DateMatch
          </span>
        </Link>
      </motion.div>

      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8"
        >
          <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 text-center">
            找到你的完美匹配
          </h1>
          <p className="text-gray-600 text-center mb-8">
            发现为你量身打造的缘分！
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">姓名</label>
              <Input
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full"
                placeholder="你的名字"
              />
              <p className="text-sm text-gray-500 mt-1">
                这将是其他用户看到的名称
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">年龄</label>
              <Input
                required
                type="number"
                min="18"
                max="100"
                value={formData.age}
                onChange={(e) =>
                  setFormData({ ...formData, age: e.target.value })
                }
                className="w-full"
                placeholder="你的年龄（需满18岁）"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">性别</label>
              <Select
                required
                value={formData.gender}
                onValueChange={(value) =>
                  setFormData({ ...formData, gender: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择你的性别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="female">女</SelectItem>
                  <SelectItem value="non-binary">非二元性别</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">寻找</label>
              <Select
                required
                value={formData.seeking}
                onValueChange={(value) =>
                  setFormData({ ...formData, seeking: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="请选择你想寻找的性别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="female">女</SelectItem>
                  <SelectItem value="non-binary">非二元性别</SelectItem>
                  <SelectItem value="any">不限</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                学校
              </label>
              <Input
                required
                type="text"
                value={formData.university}
                onChange={(e) =>
                  setFormData({ ...formData, university: e.target.value })
                }
                className="w-full"
                placeholder="请输入你的学校"
              />
              <p className="text-sm text-gray-500 mt-1">
                当前或最近就读的大学
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">邮箱</label>
              <Input
                required
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full"
                placeholder="yourmail@mail.com"
              />
              <p className="text-sm text-gray-500 mt-1">
                我们将用此邮箱通知你匹配结果
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                兴趣爱好
              </label>
              <Textarea
                required
                value={formData.interests}
                onChange={(e) =>
                  setFormData({ ...formData, interests: e.target.value })
                }
                className="w-full h-32"
                placeholder="告诉我们你的兴趣爱好..."
              />
              <p className="text-sm text-gray-500 mt-1">
                你平时喜欢做什么？
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                理想约会
              </label>
              <Textarea
                required
                value={formData.idealDate}
                onChange={(e) =>
                  setFormData({ ...formData, idealDate: e.target.value })
                }
                className="w-full h-32"
                placeholder="描述你理想的约会..."
              />
              <p className="text-sm text-gray-500 mt-1">
                你梦想中的约会是什么样的？
              </p>
            </div>

            <style jsx global>{`
              .select-trigger {
                border-color: #ec4899 !important;
              }
              .select-trigger:focus {
                ring-color: #ec4899 !important;
              }
              input:focus,
              textarea:focus {
                border-color: #ec4899 !important;
                ring-color: #ec4899 !important;
              }
            `}</style>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 px-8 rounded-full text-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:from-pink-600 hover:to-purple-700"
            >
              找到我的缘分
              <Heart className="ml-2 h-5 w-5 animate-pulse" />
            </Button>
          </form>
        </motion.div>
      </div>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="bg-white/95 backdrop-blur-sm">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-pink-500 to-purple-600 text-transparent bg-clip-text">
              提交成功！💝
            </DialogTitle>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 text-center space-y-4"
          >
            <p className="text-lg text-gray-700">
              感谢提交你的资料！我们很期待帮助你找到完美匹配。
            </p>
            <p className="text-gray-600">
              我们将尽快与你联系，提供符合你个性和偏好的潜在匹配对象。
            </p>
            <div className="flex justify-center pt-4">
              <Heart className="text-pink-500 h-8 w-8 animate-pulse" />
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function FindMatch() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg text-gray-600">加载中...</div>
        </div>
      }
    >
      <FindMatchParams />
    </Suspense>
  );
}
